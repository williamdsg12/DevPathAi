import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-white/10",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        "p-5 text-start sm:p-6",
        "hover:from-white/[0.1] hover:to-white/[0.04] hover:border-violet-500/30",
        "max-w-[320px] sm:max-w-[320px] shrink-0",
        "transition-all duration-300 shadow-md backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-white/10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-sm font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
        {text}
      </p>
    </Card>
  )
}
