import Navbar from "../components/Navbar";
import Hero from "../components/Hero"
import About from "../components/About"
import Results from "../components/Results"
import Teachers from "../components/Teachers"
import CTASection from "../components/CTASection"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Results />
      <Teachers />
      <CTASection />
      <Footer />
    </>
  )
}

export default Home