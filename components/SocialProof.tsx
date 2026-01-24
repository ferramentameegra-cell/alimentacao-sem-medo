'use client'

export default function SocialProof() {
  const testimonials = [
    {
      name: 'Maria Helena Duarte',
      age: 58,
      condition: 'Azia e refluxo',
      rating: 5,
      text: 'Eu tinha medo de comer qualquer coisa. Hoje eu abro o cardápio e sei exatamente o que é seguro. Minha vida ficou mais leve.',
    },
    {
      name: 'Carlos Alberto Menezes',
      age: 62,
      condition: 'Intestino preso',
      rating: 5,
      text: 'Nunca gostei de dieta. Aqui não parece dieta. Parece cuidado. Depois de anos, voltei a comer sem receio.',
    },
    {
      name: 'Ana Lúcia Farias',
      age: 49,
      condition: 'Síndrome do Intestino Irritável',
      rating: 5,
      text: 'O maior alívio foi parar de adivinhar o que podia comer. A plataforma me trouxe tranquilidade.',
    },
  ]

  return (
    <section className="mb-16 max-w-full">
      <h2 className="text-3xl font-bold text-text-primary mb-10 tracking-tight" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
        Quem já voltou a comer sem medo
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-96 h-auto rounded-xl p-8 card-hover transition-all duration-300"
            style={{
              background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
              border: '1px solid rgba(110, 143, 61, 0.25)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">
                {testimonial.name}
              </h3>
              <p className="text-base text-accent-primary mb-4 font-semibold">
                {testimonial.age} anos — {testimonial.condition}
              </p>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
            </div>
            <p className="text-lg text-text-secondary/90 leading-relaxed italic font-light">
              "{testimonial.text}"
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
