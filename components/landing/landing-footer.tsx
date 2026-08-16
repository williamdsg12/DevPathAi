import { Logo } from '@/components/logo'

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Seu caminho inteligente para se tornar um desenvolvedor.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-muted-foreground sm:grid-cols-3">
          <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
          <a href="#recursos" className="hover:text-foreground">Recursos</a>
          <a href="#trilhas" className="hover:text-foreground">Trilhas</a>
          <a href="#depoimentos" className="hover:text-foreground">Depoimentos</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <a href="/login" className="hover:text-foreground">Entrar</a>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} DevPath AI. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
