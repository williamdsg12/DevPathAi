import {
  Atom,
  Braces,
  Brain,
  Briefcase,
  Code,
  Crown,
  Database,
  Flame,
  Footprints,
  GitBranch,
  Layers,
  Medal,
  Palette,
  Rocket,
  Server,
  Terminal,
  Trophy,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  brain: Brain,
  workflow: Workflow,
  'git-branch': GitBranch,
  code: Code,
  palette: Palette,
  braces: Braces,
  atom: Atom,
  server: Server,
  database: Database,
  layers: Layers,
  briefcase: Briefcase,
  footprints: Footprints,
  terminal: Terminal,
  flame: Flame,
  rocket: Rocket,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
}

export function getIcon(name: string): LucideIcon {
  return map[name] ?? Code
}
