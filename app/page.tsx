import { LandingHeader } from '@/components/landing/landing-header'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section'
import { PersonalizedPathSection } from '@/components/landing/personalized-path-section'
import { DevMentorAISection } from '@/components/landing/devmentor-ai-section'
import { PracticeCodeLabSection } from '@/components/landing/practice-codelab-section'
import { CareerProgressSection } from '@/components/landing/career-progress-section'
import { TestimonialsMarqueeSection } from '@/components/landing/testimonials-marquee-section'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCtaSection } from '@/components/landing/final-cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata = {
  title: 'DEVPATH AI — Pare de estudar programação sem saber para onde ir',
  description:
    'Uma plataforma com inteligência artificial que cria sua trilha personalizada, acompanha seu progresso e guia você do zero até sua carreira profissional como desenvolvedor.',
}

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0910] text-foreground selection:bg-violet-600 selection:text-white">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <ProblemSolutionSection />
        <PersonalizedPathSection />
        <DevMentorAISection />
        <PracticeCodeLabSection />
        <CareerProgressSection />
        <TestimonialsMarqueeSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
