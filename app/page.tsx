import { ScrollProgressBar } from '@/components/landing/scroll-progress-bar'
import { LandingHeader } from '@/components/landing/landing-header'
import { HeroSection } from '@/components/landing/hero-section'
import { TechTicker } from '@/components/landing/tech-ticker'
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section'
import { OnboardingInteractiveDemo } from '@/components/landing/onboarding-interactive-demo'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { PersonalizedPathSection } from '@/components/landing/personalized-path-section'
import { DevMentorAISection } from '@/components/landing/devmentor-ai-section'
import { PracticeCodeLabSection } from '@/components/landing/practice-codelab-section'
import { CoursesShowcase } from '@/components/landing/courses-showcase'
import { ProjectsShowcase } from '@/components/landing/projects-showcase'
import { CareerProgressSection } from '@/components/landing/career-progress-section'
import { PricingPlansSection } from '@/components/landing/pricing-plans-section'
import { TestimonialsMarqueeSection } from '@/components/landing/testimonials-marquee-section'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCtaSection } from '@/components/landing/final-cta-section'
import { CinematicFooter } from '@/components/ui/motion-footer'

export const metadata = {
  title: 'DEVPATH AI — Pare de estudar programação sem saber para onde ir',
  description:
    'Uma plataforma com inteligência artificial que cria sua trilha personalizada, acompanha seu progresso diário e guia você do zero absoluto até sua carreira profissional como desenvolvedor.',
}

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0910] text-foreground selection:bg-violet-600 selection:text-white">
      {/* Global Scroll Progress */}
      <ScrollProgressBar />

      {/* Floating Dynamic Header */}
      <LandingHeader />

      <main className="flex-1">
        {/* 1. Hero with 3D Cinematic Scroll Storytelling Product Showcase */}
        <HeroSection />

        {/* 2. Skills & Tech Stack Continuous Marquee Ticker */}
        <TechTicker />

        {/* 3. Problem vs Solution */}
        <ProblemSolutionSection />

        {/* 4. Interactive AI Onboarding Experience Simulator */}
        <OnboardingInteractiveDemo />

        {/* 5. Methodology & 6 Pedagogical Steps */}
        <HowItWorksSection />

        {/* 6. Personalized Path & 5 Career Phases */}
        <PersonalizedPathSection />

        {/* 7. DevMentor AI 24/7 Contextual Assistant */}
        <DevMentorAISection />

        {/* 8. Practical Learning & 5 Completion Criteria & Code Lab */}
        <PracticeCodeLabSection />

        {/* 9. Official Courses & Modules Catalog */}
        <CoursesShowcase />

        {/* 10. Real Projects for Portfolio (GitHub Evaluated) */}
        <ProjectsShowcase />

        {/* 11. Career Progression Timeline & Interview Simulator */}
        <CareerProgressSection />

        {/* 12. Transparent Pricing Plans */}
        <PricingPlansSection />

        {/* 13. Infinite Testimonials Marquee */}
        <TestimonialsMarqueeSection />

        {/* 14. FAQ with Animated Accordion */}
        <FaqSection />

        {/* 15. Final Cinematic Call to Action */}
        <FinalCtaSection />
      </main>

      {/* Footer cinematográfico com revelação em cortina */}
      <CinematicFooter />
    </div>
  )
}
