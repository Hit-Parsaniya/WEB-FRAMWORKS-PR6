import '../App.css'

function About({ bio, highlights }) {
  return (
    <section id="about" className="section-card">
      <h2>About Me</h2>
      <p className="section-text">{bio}</p>
      <ul className="highlight-list">
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default About
