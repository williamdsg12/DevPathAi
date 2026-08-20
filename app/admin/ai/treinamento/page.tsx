'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AITreinamentoRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/ai')
  }, [router])
  return null
}
