import '../App.css'

function Skills({ skillList, title }) {
  const getEmoji = (skillName) => {
    const emojiMap = {
      'Java': '☕',
      'Node.js': '🟢',
      'SQL': '💾',
      'Python': '🐍',
      'NumPy': '📊',
      'Pandas': '🐼',
      'Matplotlib': '📈',
      'HTML': '🏷️',
      'CSS': '🎨',
      'JavaScript': '⚡',
      'React': '⚛️',
      'Git': '🔗',
    }
    return emojiMap[skillName] || '✨'
  }

  return (
    <section id="skills" className="skills-section">
      <h2 className="section-heading">
        {title}
        <span className="heading-accent">every day</span>
      </h2>
      <div className="skills-grid">
        {skillList.map((skill) => (
          <div key={skill.name} className="skill-card">
            <div className="skill-emoji">{getEmoji(skill.name)}</div>
            <h3 className="skill-name">{skill.name}</h3>
            <p className="skill-proficiency">{skill.proficiency}%</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
