import { LandingHeader } from '@/components/landing/landing-header'
import { Hero } from '@/components/landing/hero'
import {
  Features,
  HowItWorks,
  ProblemSolution,
} from '@/components/landing/landing-sections'
import {
  Faq,
  FinalCta,
  Testimonials,
} from '@/components/landing/testimonials-faq'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ProblemSolution />
        <Features />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
