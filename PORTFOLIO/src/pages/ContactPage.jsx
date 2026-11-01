import { useState } from 'react'
import '../App.css'

function ContactPage() {
  const [message, setMessage] = useState('')
  const [showHint, setShowHint] = useState(true)

  return (
    <section className="section-card contact-page">
      <h2>Contact Me</h2>
      <p className="section-text">
        Share a quick note and I will get back to you as soon as possible.
      </p>

      <div className="contact-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setShowHint((value) => !value)}>
          {showHint ? 'Hide Tips' : 'Show Tips'}
        </button>
      </div>

      {showHint && (
        <div className="hint-box">
          <p>Tip: Keep your message short and mention your preferred contact method.</p>
        </div>
      )}

      <label className="form-label" htmlFor="message">
        Your message
      </label>
      <textarea
        id="message"
        className="message-input"
        rows="6"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Write your message here..."
      />

      <p className="char-count">{message.length}/180 characters</p>
      <p className="preview-box">{message || 'Your message preview will appear here.'}</p>
    </section>
  )
}

export default ContactPage
