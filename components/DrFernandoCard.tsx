'use client'

import Image from 'next/image'

export default function DrFernandoCard() {
  return (
    <section className="mb-16 max-w-full">
      <div className="max-w-4xl mx-auto rounded-xl bg-dark-card border border-lilac/20 p-12 card-hover transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        <h2 className="text-3xl font-bold text-text-primary mb-10 tracking-tight">
          Quem está por trás do Planeta Intestino
        </h2>
        
        <div className="flex gap-10 mb-10">
          <div className="w-40 h-40 rounded-full bg-dark-secondary border-2 border-lilac/40 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:border-neon-purple/60 hover:scale-105 overflow-hidden"
            style={{
              boxShadow: '0 4px 20px rgba(199, 125, 255, 0.2)'
            }}
          >
            <Image
              src="/foto/fotoperfil.PNG"
              alt="Dr. Fernando Lemos"
              width={160}
              height={160}
              className="w-full h-full object-cover rounded-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neon-purple mb-3 tracking-tight">
              Dr. Fernando Lemos
            </h3>
            <p className="text-lg text-neon-cyan mb-4 font-semibold">
              Coloproctologista • Especialista em saúde intestinal
            </p>
          </div>
        </div>

        <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
          <p className="font-light">
            Dr. Fernando Lemos é coloproctologista, com mais de duas décadas dedicadas ao cuidado da saúde intestinal.
          </p>
          <p className="font-light">
            Ao longo de sua trajetória, percebeu que muitas pessoas sofrem não apenas pelos sintomas digestivos, mas pelo medo constante de comer.
          </p>
          <p className="font-light">
            O Planeta Intestino nasceu desse olhar: traduzir a ciência em orientações simples, seguras e possíveis para o dia a dia.
          </p>
          <p className="text-neon-cyan font-bold">
            Esta plataforma segue exatamente esse princípio — menos medo, mais clareza e cuidado contínuo.
          </p>
        </div>
      </div>
    </section>
  )
}
