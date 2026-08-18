'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Check, RefreshCw, Share2, ExternalLink, Globe } from 'lucide-react'
import { LinkedinIcon, GithubIcon, YoutubeIcon, TwitterIcon, InstagramIcon } from '@/components/icons'
import { toast } from 'sonner'

export function SocialLinksTab() {
  const { profile, updateSocialLinks } = useAppStore()
  const initial = profile?.socialLinks || {}

  const [linkedin, setLinkedin] = useState(initial.linkedin || '')
  const [github, setGithub] = useState(initial.github || '')
  const [facebook, setFacebook] = useState(initial.facebook || '')
  const [instagram, setInstagram] = useState(initial.instagram || '')
  const [pinterest, setPinterest] = useState(initial.pinterest || '')
  const [youtube, setYoutube] = useState(initial.youtube || '')
  const [twitter, setTwitter] = useState(initial.twitter || '')
  const [blog, setBlog] = useState(initial.blog || '')
  const [isSaving, setIsSaving] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    updateSocialLinks({
      linkedin,
      github,
      facebook,
      instagram,
      pinterest,
      youtube,
      twitter,
      blog,
    })

    setTimeout(() => {
      setIsSaving(false)
      toast.success('Redes sociais atualizadas com sucesso!')
    }, 350)
  }

  return (
    <Card className="border-white/10 bg-[#0e0d16] text-white rounded-3xl shadow-xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
          <Share2 className="size-5 text-cyan-400" /> Redes Sociais & Links Profissionais
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Adicione suas redes sociais para que recrutadores e outros desenvolvedores possam se conectar com você.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <LinkedinIcon className="size-4 text-blue-400" /> LinkedIn
                </Label>
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/seuperfil"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <GithubIcon className="size-4 text-zinc-300" /> GitHub
                </Label>
                {github && (
                  <a href={github.startsWith('http') ? github : `https://github.com/${github}`} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/seuusuario"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <YoutubeIcon className="size-4 text-red-500" /> YouTube
                </Label>
                {youtube && (
                  <a href={youtube} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@seucanal"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <InstagramIcon className="size-4 text-pink-400" /> Instagram
                </Label>
                {instagram && (
                  <a href={instagram} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/seuusuario"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Twitter / X */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <TwitterIcon className="size-4 text-sky-400" /> Twitter / X
                </Label>
                {twitter && (
                  <a href={twitter} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/seuusuario"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Blog / Portfolio Website */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Globe className="size-4 text-emerald-400" /> Blog / Website Pessoal
                </Label>
                {blog && (
                  <a href={blog} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5">
                    Testar link <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
              <Input
                value={blog}
                onChange={(e) => setBlog(e.target.value)}
                placeholder="https://seusite.dev"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Facebook</Label>
              <Input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/seuperfil"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {/* Pinterest */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-300">Pinterest</Label>
              <Input
                value={pinterest}
                onChange={(e) => setPinterest(e.target.value)}
                placeholder="https://pinterest.com/seuperfil"
                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm px-8 py-5 rounded-2xl shadow-xl shadow-cyan-500/20 gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Check className="size-4" /> Salvar Redes Sociais
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
