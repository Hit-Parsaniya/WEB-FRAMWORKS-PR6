import { NavLink } from 'react-router-dom'
import '../App.css'

function Navbar({ links, isDarkMode, onToggleTheme }) {
  return (
    <nav className="top-nav" aria-label="Primary navigation">
      {links.map((link) => (
        <NavLink
          key={link.label}
          to={link.to}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
      <button type="button" className="theme-toggle" onClick={onToggleTheme}>
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </nav>
  )
}

export default Navbar
