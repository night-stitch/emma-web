import HomeServices from './components/HomeServices';
import HomeExperiences from './components/HomeExperiences';
import GoogleReviews from './components/GoogleReviews';
import HeroSection from './components/HeroSection';
import Engagement from './components/Engagement';
import AboutMe from './components/AboutMe';

export default function Home() {
    return (
        <div className="scroll-smooth">

            {/* SECTION 1 : HERO */}
            <section id="hero" className="h-screen w-full snap-start relative flex items-center justify-center">
                <HeroSection />
            </section>

            {/* SECTION 2 : SERVICES */}
            <section id="services" className="min-h-screen w-full snap-start relative flex items-center justify-center pt-20">
                <div className="w-full h-full">
                    <HomeServices />
                </div>
            </section>

            {/* SECTION 3 : EXPÉRIENCE (maisons étoilées dans l'admin) */}
            <section id="experiences" className="min-h-screen w-full snap-start relative flex items-center justify-center pt-20">
                <div className="w-full h-full">
                    <HomeExperiences />
                </div>
            </section>

            {/* SECTION 4 : ENGAGEMENT */}
            <section id="engagement" className="min-h-screen w-full snap-start relative flex items-center justify-center">
                <Engagement />
            </section>

            {/* SECTION 5 : ABOUT */}
            <section id="about" className="min-h-screen w-full snap-start relative flex items-center justify-center">
                <AboutMe />
            </section>

            {/* SECTION 6 : AVIS GOOGLE (masquée automatiquement si non configurée) */}
            <GoogleReviews />
        </div>
    );
}