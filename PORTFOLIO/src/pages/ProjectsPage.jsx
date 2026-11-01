import { useState, useEffect } from 'react'
import '../App.css'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import RepoList from '../components/RepoList'

function ProjectsPage() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // GitHub username - replace with your actual GitHub username
  const GITHUB_USERNAME = 'Hit-Parsaniya'

  // Fetch repositories from GitHub API
  const fetchRepositories = () => {
    setLoading(true)
    setError(null)

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // Filter out forked repositories for cleaner display (optional)
        const ownRepos = data.filter((repo) => !repo.fork)
        setRepos(ownRepos)
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch repositories. Please try again.')
        setRepos([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Trigger fetch on component mount
  useEffect(() => {
    fetchRepositories()
  }, [])

  // Conditional rendering based on state
  if (loading) {
    return (
      <section className="section-card">
        <h2>Projects</h2>
        <p className="section-text">
          Loading repositories from GitHub...
        </p>
        <Spinner />
      </section>
    )
  }

  if (error) {
    return (
      <section className="section-card">
        <h2>Projects</h2>
        <p className="section-text">
          There was an issue loading the repositories.
        </p>
        <ErrorMessage message={error} onRetry={fetchRepositories} />
      </section>
    )
  }

  // Success state
  return (
    <section className="section-card">
      <h2>Projects</h2>
      <p className="section-text">
        Explore my GitHub repositories and see what I've been building.
      </p>
      <RepoList repos={repos} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
    </section>
  )
}

export default ProjectsPage
