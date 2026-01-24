'use client'

import Image from 'next/image'

export default function DrFernandoCard() {
  return (
    <section className="mb-16 max-w-full">
      <div
        className="max-w-4xl mx-auto rounded-xl p-12 card-hover transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
          border: '1px solid rgba(110, 143, 61, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}
      >
        <h2 className="text-3xl font-bold text-text-primary mb-10 tracking-tight" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
          Quem está por trás do Planeta Intestino
        </h2>

        <div className="flex gap-10 mb-10">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
              border: '1px solid rgba(110, 143, 61, 0.25)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
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
            <h3 className="text-2xl font-bold text-accent-primary mb-3 tracking-tight">
              Dr. Fernando Lemos
            </h3>
            <p className="text-lg text-accent-primary mb-4 font-semibold">
              Coloproctologista • Especialista em saúde intestinal
            </p>
          </div>
        </div>

        <div className="space-y-6 text-lg text-text-secondary/90 leading-relaxed">
          <p className="font-light">
            Dr. Fernando Lemos é coloproctologista, com mais de duas décadas dedicadas ao cuidado da saúde intestinal.
          </p>
          <p className="font-light">
            Ao longo de sua trajetória, percebeu que muitas pessoas sofrem não apenas pelos sintomas digestivos, mas pelo medo constante de comer.
          </p>
          <p className="font-light">
            O Planeta Intestino nasceu desse olhar: traduzir a ciência em orientações simples, seguras e possíveis para o dia a dia.
          </p>
          <p className="text-accent-primary font-bold">
            Esta plataforma segue exatamente esse princípio — menos medo, mais clareza e cuidado contínuo.
          </p>
        </div>
      </div>
    </section>
  )
}
