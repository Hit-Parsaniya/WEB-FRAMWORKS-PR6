import './RepoList.css'

function RepoList({ repos, searchTerm, onSearchChange }) {
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="repo-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredRepos.length === 0 ? (
        <p className="no-repos">No repositories found.</p>
      ) : (
        <div className="repo-grid">
          {filteredRepos.map((repo) => (
            <article key={repo.id} className="repo-card">
              <div className="repo-header">
                <h3>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </h3>
                {repo.stargazers_count > 0 && (
                  <span className="star-count">⭐ {repo.stargazers_count}</span>
                )}
              </div>
              {repo.description && (
                <p className="repo-description">{repo.description}</p>
              )}
              <div className="repo-footer">
                {repo.language && (
                  <span className="language-badge">{repo.language}</span>
                )}
                <span className="updated-at">
                  Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="repo-count">
        Showing {filteredRepos.length} of {repos.length} repositories
      </p>
    </div>
  )
}

export default RepoList
