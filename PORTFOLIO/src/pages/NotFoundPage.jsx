import { Link } from 'react-router-dom'
import '../App.css'

function NotFoundPage() {
  return (
    <section className="section-card not-found-card">
      <h2>404 - Page Not Found</h2>
      <p className="section-text">
        The page you are looking for does not exist. Return home to continue exploring.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  )
}

export default NotFoundPage
