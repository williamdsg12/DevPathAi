'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AIConfiguracoesRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/ai')
  }, [router])
  return null
}
