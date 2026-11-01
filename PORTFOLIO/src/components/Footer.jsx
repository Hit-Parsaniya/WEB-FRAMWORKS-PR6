import '../App.css'

function Footer({ email, linkedin, twitter }) {
  return (
    <footer id="contact" className="footer-section">
      <p className="footer-tagline">Let's build something amazing together.</p>
      <div className="contact-section">
        <h3>Get in Touch</h3>
        <a href={`mailto:${email}`} className="contact-email">
          {email}
        </a>
      </div>
      <div className="footer-socials">
        {linkedin && <a href={linkedin} title="LinkedIn" target="_blank" rel="noreferrer">💼</a>}
        {twitter && <a href={twitter} title="Twitter" target="_blank" rel="noreferrer">𝕏</a>}
      </div>
      <p className="footer-copyright">© 2026 All rights reserved. Built with ❤️ by Hit.</p>
    </footer>
  )
}

export default Footer
