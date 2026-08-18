'use client'

import DigitalSerenity from '@/components/ui/digital-serenity-animated-landing-page'

const DemoOne = () => {
  return <DigitalSerenity />
}

// Full-viewport hero variant: starts the floating dots on mount, since a
// non-scrolling page never fires the scroll event they wait for.
const DemoFloatingOnMount = () => {
  return <DigitalSerenity animateFloatingOnMount />
}

export { DemoOne, DemoFloatingOnMount }
export default DemoOne
