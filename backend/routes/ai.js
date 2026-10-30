const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Rate limiting storage: tracks client request timestamps to prevent abuse
// (Practical 13 - Supplementary Problem 2)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds cooldown per task title per client

// Helper: Contextual local fallback generation if API key is missing or third-party call fails
function generateContextualFallback(title = '') {
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLowerCase();

  if (lower.includes('test') || lower.includes('qa')) {
    return `Conduct thorough testing for "${cleanTitle}". Verify all edge cases, execute automated regression suites, and document test coverage.`;
  }
  if (lower.includes('bug') || lower.includes('fix') || lower.includes('issue')) {
    return `Investigate and resolve issue: "${cleanTitle}". Reproduce the error in development, implement the fix, and verify with unit tests.`;
  }
  if (lower.includes('docker') || lower.includes('deploy') || lower.includes('ci')) {
    return `Execute deployment task: "${cleanTitle}". Review Dockerfiles, verify environment configurations, and validate pipeline status.`;
  }
  if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt')) {
    return `Implement and verify secure authentication flow for "${cleanTitle}". Validate token signing, expiration, and protected route handlers.`;
  }
  if (lower.includes('design') || lower.includes('ui') || lower.includes('frontend')) {
    return `Develop responsive UI components for "${cleanTitle}". Ensure cross-device compatibility, accessible contrast ratios, and smooth interactions.`;
  }

  return `Ensure all deliverables for "${cleanTitle}" are reviewed, dependencies verified, and execution documented according to project requirements.`;
}

// POST /api/ai/generate-description
// Accepts: { title: string }
// Returns: { description: string, fallback: boolean, provider: string, disclaimer: string }
router.post('/generate-description', async (req, res) => {
  const title = (req.body?.title || '').trim();

  if (!title) {
    return res.status(400).json({
      message: 'Task title is required to generate an AI description.',
      fallback: true,
    });
  }

  // --- Supplementary Problem 2: Rate Limiting ---
  const clientIdentifier = `${req.ip || 'local'}:${title.toLowerCase()}`;
  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(clientIdentifier);

  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequestTime)) / 1000);
    return res.status(200).json({
      description: generateContextualFallback(title),
      fallback: true,
      rateLimited: true,
      remainingSeconds,
      provider: 'rate-limited-fallback',
      message: `Rate limit active: Please wait ${remainingSeconds}s before regenerating for this task.`,
      disclaimer: 'Rate limit cooldown active. Using local fallback template.',
    });
  }

  // Record timestamp for rate limiting
  rateLimitMap.set(clientIdentifier, now);

  // Clean old rate limit entries to prevent memory leak
  if (rateLimitMap.size > 500) {
    for (const [key, timestamp] of rateLimitMap.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(key);
      }
    }
  }

  // --- Provider 1: OpenAI API ---
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.trim() !== '' && !openAiKey.includes('your_')) {
    try {
      const client = new OpenAI({ apiKey: openAiKey });
      const prompt = `You are a productivity assistant for a Task Management application.
Write a concise, professional, and actionable task description (1 to 3 sentences maximum) for a task titled: "${title}".
Do NOT include preamble, quotes, or markdown headings. Directly output the description.`;

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.7,
      });

      const aiText = completion?.choices?.[0]?.message?.content?.trim();
      if (aiText) {
        return res.status(200).json({
          description: aiText,
          fallback: false,
          provider: 'OpenAI (gpt-4o-mini)',
          disclaimer: 'AI-generated suggestion. Please review and edit before saving.',
        });
      }
    } catch (err) {
      console.warn(`[AI Route] OpenAI API call failed (${err.message}). Activating graceful degradation fallback.`);
    }
  }

  // --- Provider 2: Google Gemini API ---
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('your_')) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Write a concise, actionable 1 to 2 sentence task description for: "${title}". Return only the plain description text.`,
              },
            ],
          },
        ],
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generated) {
          return res.status(200).json({
            description: generated,
            fallback: false,
            provider: 'Google Gemini (1.5 Flash)',
            disclaimer: 'AI-generated suggestion. Please review and edit before saving.',
          });
        }
      } else {
        console.warn(`[AI Route] Gemini API returned status ${geminiRes.status}. Activating graceful degradation.`);
      }
    } catch (err) {
      console.warn(`[AI Route] Gemini API call error (${err.message}). Activating graceful degradation.`);
    }
  }

  // --- Graceful Degradation Fallback (Core Requirement) ---
  // When no key is configured or third-party service is unreachable/errored,
  // return an intelligent local suggestion so the application NEVER crashes!
  const fallbackDescription = generateContextualFallback(title);
  return res.status(200).json({
    description: fallbackDescription,
    fallback: true,
    provider: 'local-fallback',
    disclaimer: 'AI service unavailable or not configured. Contextual fallback suggestion provided.',
  });
});

// GET /api/ai/status - diagnostic endpoint to check AI configuration
router.get('/status', (req, res) => {
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'));
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'));

  res.status(200).json({
    status: 'online',
    openAiConfigured: hasOpenAi,
    geminiConfigured: hasGemini,
    activeProvider: hasOpenAi ? 'OpenAI (gpt-4o-mini)' : hasGemini ? 'Google Gemini' : 'Graceful Fallback Mode',
    rateLimitCooldownSeconds: RATE_LIMIT_WINDOW_MS / 1000,
  });
});

module.exports = router;
