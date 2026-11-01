import '../App.css'
import Header from '../components/Header'
import About from '../components/About'
import Skills from '../components/Skills'
import Footer from '../components/Footer'

function HomePage() {
  const highlights = [
    'Building full-stack web applications with modern tools and frameworks',
    'Focused on clean architecture, reusable components, and practical problem solving',
    'Enjoys turning ideas into scalable digital solutions with strong user experience',
  ]

  const skills = [
    { name: 'Java', proficiency: 85 },
    { name: 'HTML', proficiency: 90 },
    { name: 'CSS', proficiency: 88 },
    { name: 'JavaScript', proficiency: 87 },
    { name: 'Node.js', proficiency: 82 },
    { name: 'SQL', proficiency: 84 },
    { name: 'Python', proficiency: 86 },
    { name: 'Git', proficiency: 88 },
    { name: 'React', proficiency: 85 },
    { name: 'NumPy', proficiency: 80 },
    { name: 'Pandas', proficiency: 81 },
    { name: 'Matplotlib', proficiency: 80 },
  ]

  return (
    <>
      <Header
        name="Hit Parsaniya"
        title="Information Technology Student & Full-Stack Developer"
        themeColor="#6c63ff"
      />
      <main className="content-stack">
        <About
          bio="I am a student developer passionate about building modern, responsive web applications and learning practical full-stack development skills."
          highlights={highlights}
        />
        <Skills skillList={skills} title="Technologies I work with" />
      </main>
      <Footer email="24it059@charusat.edu.in" />
    </>
  )
}

export default HomePage
