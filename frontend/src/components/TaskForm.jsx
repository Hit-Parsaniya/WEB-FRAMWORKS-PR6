import { useState } from 'react';
import { generateAiDescription } from '../api';

export default function TaskForm({ onCreate, creating }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUser, setAssignedUser] = useState('');

  // Practical 13: AI Integration States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMeta, setAiMeta] = useState(null);
  const [aiError, setAiError] = useState(null);

  const handleGenerateAi = async () => {
    if (!title.trim()) {
      setAiError('Please enter a task title first before generating a description.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const data = await generateAiDescription(title.trim());
      if (data && data.description) {
        // Editable suggestion: fills description input so user can edit or accept
        setDescription(data.description);
        setAiMeta({
          provider: data.provider || 'AI Assistant',
          fallback: Boolean(data.fallback),
          rateLimited: Boolean(data.rateLimited),
          remainingSeconds: data.remainingSeconds,
          disclaimer: data.disclaimer || 'AI-generated suggestion. Please review and edit before saving.',
        });
      }
    } catch (err) {
      // Graceful frontend degradation: never crash if network or server fails
      console.warn('[TaskForm AI Error]', err);
      setAiError('Unable to connect to AI service. You can type the description manually.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      assignedUser: assignedUser.trim() || undefined,
    });

    // Reset form states
    setTitle('');
    setDescription('');
    setAssignedUser('');
    setAiMeta(null);
    setAiError(null);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group-with-ai">
        <input
          type="text"
          className="task-input-title"
          placeholder="Task title (e.g. Implement user authentication) *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button
          type="button"
          className={`btn btn-ai ${isAiLoading ? 'loading' : ''}`}
          onClick={handleGenerateAi}
          disabled={isAiLoading || !title.trim()}
          title="Auto-generate description with AI (OpenAI / Gemini / Fallback)"
        >
          {isAiLoading ? (
            <>
              <span className="spinner-icon"></span>
              Generating with AI...
            </>
          ) : (
            <>
              <span className="sparkle-icon">✨</span>
              Generate with AI
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="ai-alert-banner ai-alert-warning">
          <span>⚠️ {aiError}</span>
        </div>
      )}

      {/* Practical 13 Supplementary Problem 3: Visible AI Disclaimer Banner */}
      {aiMeta && (
        <div className={`ai-disclaimer-box ${aiMeta.fallback ? 'fallback' : 'live-ai'}`}>
          <div className="ai-disclaimer-header">
            <span className="ai-provider-pill">
              {aiMeta.fallback ? '💡 Contextual Fallback' : `🤖 ${aiMeta.provider}`}
            </span>
            {aiMeta.rateLimited && (
              <span className="ai-rate-pill">
                ⏳ Cooldown {aiMeta.remainingSeconds}s
              </span>
            )}
          </div>
          <p className="ai-disclaimer-text">
            <strong>Disclaimer:</strong> {aiMeta.disclaimer}
          </p>
          <small className="ai-disclaimer-tip">
            ✏️ This suggestion is editable below. You can customize it before saving.
          </small>
        </div>
      )}

      <div className="form-group">
        <textarea
          rows={3}
          className="task-input-desc"
          placeholder="Task description (Type manually or click 'Generate with AI' above)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <input
        type="email"
        placeholder="Assigned user email (e.g. dev@example.com)"
        value={assignedUser}
        onChange={(e) => setAssignedUser(e.target.value)}
      />

      <button className="btn btn-primary" type="submit" disabled={creating}>
        {creating ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
}
