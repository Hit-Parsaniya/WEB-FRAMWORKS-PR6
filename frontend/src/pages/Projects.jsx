import React, { useState, useEffect, useCallback } from 'react';

// Color map for common GitHub programming languages
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
};

// Curated fallback repositories if GitHub API encounters rate limit or network issues
const CURATED_REPOS = [
  {
    id: 1,
    name: 'express',
    full_name: 'expressjs/express',
    html_url: 'https://github.com/expressjs/express',
    clone_url: 'https://github.com/expressjs/express.git',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    language: 'JavaScript',
    stargazers_count: 65200,
    forks_count: 12400,
    open_issues_count: 142,
    owner: {
      login: 'expressjs',
      avatar_url: 'https://avatars.githubusercontent.com/u/5658226?v=4',
    },
    topics: ['express', 'framework', 'nodejs', 'rest-api'],
  },
  {
    id: 2,
    name: 'react',
    full_name: 'facebook/react',
    html_url: 'https://github.com/facebook/react',
    clone_url: 'https://github.com/facebook/react.git',
    description: 'The library for web and native user interfaces',
    language: 'JavaScript',
    stargazers_count: 228000,
    forks_count: 45600,
    open_issues_count: 980,
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
    topics: ['declarative', 'frontend', 'javascript', 'react', 'ui'],
  },
  {
    id: 3,
    name: 'node',
    full_name: 'nodejs/node',
    html_url: 'https://github.com/nodejs/node',
    clone_url: 'https://github.com/nodejs/node.git',
    description: 'Node.js JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    language: 'JavaScript',
    stargazers_count: 108000,
    forks_count: 30100,
    open_issues_count: 1420,
    owner: {
      login: 'nodejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/9950313?v=4',
    },
    topics: ['javascript', 'js', 'node', 'nodejs', 'v8'],
  },
  {
    id: 4,
    name: 'mongoose',
    full_name: 'Automattic/mongoose',
    html_url: 'https://github.com/Automattic/mongoose',
    clone_url: 'https://github.com/Automattic/mongoose.git',
    description: 'MongoDB object modeling designed to work in an asynchronous environment',
    language: 'JavaScript',
    stargazers_count: 26800,
    forks_count: 3800,
    open_issues_count: 85,
    owner: {
      login: 'Automattic',
      avatar_url: 'https://avatars.githubusercontent.com/u/88781?v=4',
    },
    topics: ['database', 'javascript', 'mongodb', 'mongoose', 'nosql'],
  },
];

export default function Projects() {
  const sampleProjects = [
    {
      id: 1,
      name: 'Web Frameworks PR10 (Event-Driven Architecture)',
      status: 'Completed',
      progress: 100,
      team: 2,
      desc: 'Asynchronous event decoupling using Node.js native EventEmitter.',
    },
    {
      id: 2,
      name: 'Cloud Infrastructure & Database Scaling',
      status: 'In Progress',
      progress: 80,
      team: 4,
      desc: 'MongoDB Atlas clustering, connection pool tuning, and cache invalidation.',
    },
    {
      id: 3,
      name: 'Frontend Performance & Predictive Preloading',
      status: 'Completed',
      progress: 100,
      team: 3,
      desc: 'Vite Rollup chunk splitting and predictive route preloading on hover.',
    },
  ];

  // GitHub Search State
  const [searchQuery, setSearchQuery] = useState('web frameworks');
  const [submittedQuery, setSubmittedQuery] = useState('web frameworks');
  const [sortBy, setSortBy] = useState('stars');
  const [repositories, setRepositories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const quickChips = [
    'web frameworks',
    'express',
    'react',
    'nodejs',
    'mongodb',
    'event-driven',
  ];

  const searchGitHub = useCallback(async (query, sort = 'stars') => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query.trim()
      )}&sort=${sort}&order=desc&per_page=9`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.message?.includes('API rate limit')) {
          throw new Error('GitHub API rate limit reached. Showing curated repositories.');
        }
        throw new Error(data.message || `GitHub error: HTTP ${res.status}`);
      }

      setRepositories(data.items || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      setError(err.message);
      // Fallback to curated set on error so user always gets rich UI
      setRepositories(CURATED_REPOS);
      setTotalCount(CURATED_REPOS.length);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run initial search on mount
  useEffect(() => {
    searchGitHub(submittedQuery, sortBy);
  }, [submittedQuery, sortBy, searchGitHub]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  };

  const handleChipClick = (chip) => {
    setSearchQuery(chip);
    setSubmittedQuery(chip);
  };

  const handleCopyClone = (repo) => {
    const cloneCmd = `git clone ${repo.clone_url}`;
    navigator.clipboard.writeText(cloneCmd).then(() => {
      setCopiedId(repo.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="page-container">
      <h2>📁 Project Portfolio & GitHub Repository Explorer</h2>
      <p className="page-description">
        Manage internal framework milestones, search public open-source project repositories,
        and view repository code directly on GitHub.
      </p>

      {/* Internal Course Projects Section */}
      <div className="project-grid">
        {sampleProjects.map((proj) => (
          <div key={proj.id} className="project-card">
            <h3>{proj.name}</h3>
            <span
              className={`status-badge ${proj.status.toLowerCase().replace(' ', '-')}`}
            >
              {proj.status}
            </span>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 10px 0' }}>
              {proj.desc}
            </p>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${proj.progress}%` }}
              ></div>
            </div>
            <div className="project-meta">
              <span>Progress: {proj.progress}%</span>
              <span>Team size: {proj.team} members</span>
            </div>
          </div>
        ))}
      </div>

      {/* GitHub Repository Search Section */}
      <section className="github-search-section">
        <div className="github-section-header">
          <div>
            <h3>
              <span>🐙</span> Search GitHub Repositories
            </h3>
            <p className="github-section-subtitle">
              Search any public project, library, or framework on GitHub and open the repository instantly.
            </p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <form className="github-search-form" onSubmit={handleFormSubmit}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="github-search-input"
              placeholder="Search repository by name, topic, or keyword (e.g. express, react, web-frameworks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="github-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="stars">Most Stars ⭐</option>
            <option value="forks">Most Forks 🍴</option>
            <option value="updated">Recently Updated 🕒</option>
          </select>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="quick-chips">
          <span className="chips-label">Popular Topics:</span>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`quick-chip ${submittedQuery === chip ? 'active' : ''}`}
              onClick={() => handleChipClick(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Status / Meta message */}
        <div className="results-meta">
          <span>
            Showing results for <strong>"{submittedQuery}"</strong>
            {totalCount > 0 && ` (${formatNumber(totalCount)} repositories found)`}
          </span>
          {loading && <span style={{ color: '#2563eb' }}>Fetching from GitHub...</span>}
        </div>

        {/* Error notification banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Repositories Cards Grid */}
        <div className="repo-grid">
          {repositories.map((repo) => (
            <div key={repo.id} className="repo-card">
              <div>
                <div className="repo-card-top">
                  <img
                    src={repo.owner?.avatar_url || 'https://github.githubassets.com/favicons/favicon.png'}
                    alt={repo.owner?.login}
                    className="repo-avatar"
                  />
                  <div className="repo-title-group">
                    <div className="repo-owner-name">{repo.owner?.login}</div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-name-link"
                      title={repo.full_name}
                    >
                      {repo.name}
                    </a>
                  </div>
                </div>

                <p className="repo-desc">
                  {repo.description || 'No description provided for this repository.'}
                </p>

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="repo-topics" style={{ marginTop: '8px' }}>
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="repo-topic-pill">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* Repo Stats */}
                <div className="repo-stats">
                  {repo.language && (
                    <div className="repo-stat-item">
                      <span
                        className="language-dot"
                        style={{
                          backgroundColor: LANGUAGE_COLORS[repo.language] || '#94a3b8',
                        }}
                      ></span>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="repo-stat-item" title="Stars">
                    ⭐ {formatNumber(repo.stargazers_count)}
                  </div>
                  <div className="repo-stat-item" title="Forks">
                    🍴 {formatNumber(repo.forks_count)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="repo-actions">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-github-link"
                  >
                    <span>View on GitHub</span>
                    <span>↗</span>
                  </a>
                  <button
                    type="button"
                    className="btn-copy-clone"
                    onClick={() => handleCopyClone(repo)}
                    title="Copy git clone command"
                  >
                    {copiedId === repo.id ? 'Copied! ✔' : '📋 Clone'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
