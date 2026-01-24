'use client'

export default function IntestineBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        className="absolute inset-0 opacity-[0.07]"
      >
        {/* Intestino - brilho suave premium */}
        <path
          d="M 200 400 Q 300 300, 400 400 T 600 400 T 800 400 T 1000 400"
          stroke="#6E8F3D"
          strokeWidth="6"
          fill="none"
          className="pulse-glow"
          style={{ filter: 'drop-shadow(0 0 20px rgba(110, 143, 61, 0.2))' }}
        />
        <path
          d="M 200 450 Q 350 350, 500 450 T 800 450 T 1100 450"
          stroke="#6E8F3D"
          strokeWidth="4"
          fill="none"
          className="pulse-glow"
          style={{ filter: 'drop-shadow(0 0 15px rgba(110, 143, 61, 0.15))', animationDelay: '1s' }}
        />
        <circle cx="400" cy="400" r="60" fill="none" stroke="#4F6B58" strokeWidth="3" className="pulse-glow"
          style={{ filter: 'drop-shadow(0 0 15px rgba(79, 107, 88, 0.2))', animationDelay: '2s' }} />
        <circle cx="700" cy="400" r="50" fill="none" stroke="#6E8F3D" strokeWidth="3" className="pulse-glow"
          style={{ filter: 'drop-shadow(0 0 15px rgba(110, 143, 61, 0.15))', animationDelay: '1.5s' }} />
      </svg>
    </div>
  )
}
