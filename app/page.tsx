import HomeServices from './components/HomeServices';
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

            {/* SECTION 3 : ENGAGEMENT */}
            <section id="engagement" className="min-h-screen w-full snap-start relative flex items-center justify-center">
                <Engagement />
            </section>

            {/* SECTION 4 : ABOUT */}
            <section id="about" className="min-h-screen w-full snap-start relative flex items-center justify-center">
                <AboutMe />
            </section>
        </div>
    );
}