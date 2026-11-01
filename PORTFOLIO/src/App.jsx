import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'Contact', to: '/contact' },
  ]

  return (
    <div className={`page-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <Navbar
        links={navLinks}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((value) => !value)}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
