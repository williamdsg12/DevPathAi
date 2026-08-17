'use client'

import React from 'react'
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee'

const realDevTestimonials = [
  {
    author: {
      name: 'Marina Costa',
      handle: 'Front-end Júnior',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Finalmente parei de pular de curso em curso. A trilha me disse exatamente o que estudar e eu consegui minha primeira vaga em 7 meses de dedicação diária.',
  },
  {
    author: {
      name: 'Rafael Lima',
      handle: 'Transição de Carreira',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    text: 'O DevMentor AI explica no meu nível. Quando travo em um exercício, ele me faz pensar passo a passo em vez de entregar o gabarito. Aprendi a programar de verdade.',
  },
  {
    author: {
      name: 'Júlia Fernandes',
      handle: 'Full Stack em Formação',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
    text: 'As avaliações com nota mínima de 70% me forçaram a não pular etapas. Hoje tenho uma base sólida de algoritmos e um portfólio no GitHub que impressiona recrutadores.',
  },
  {
    author: {
      name: 'Lucas Silveira',
      handle: 'Estudante de Software',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
    text: 'O Code Lab e as dicas progressivas me destravaram na lógica de programação. A sensação de acompanhar a árvore de aprendizado sendo concluída é viciante.',
  },
]

export function TestimonialsMarqueeSection() {
  return (
    <div id="depoimentos">
      <TestimonialsSection
        title="Quem seguiu a trilha, chegou lá"
        description="Junte-se a desenvolvedores que abandonaram o tutorial hell e construíram uma carreira sólida guiados por inteligência pedagógica."
        testimonials={realDevTestimonials}
      />
    </div>
  )
}
