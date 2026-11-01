import '../App.css'

function Header({ name, title, themeColor }) {
  return (
    <header className="hero-card" style={{ '--accent-color': themeColor }}>
      <div className="hero-content">
        <p className="eyebrow">👋 Welcome to my portfolio</p>
        <h1>{name}</h1>
        <p className="hero-subtitle">{title}</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => document.getElementById('skills').scrollIntoView({ behavior: 'smooth' })}>
            Learn More
          </button>
          <button className="btn btn-secondary" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
            Get in Touch
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
