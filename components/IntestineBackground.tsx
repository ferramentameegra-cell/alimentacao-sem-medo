'use client'

export default function IntestineBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        className="absolute inset-0 opacity-10"
      >
        {/* Intestino estilizado - desenho artístico com neon lilás */}
        <path
          d="M 200 400 Q 300 300, 400 400 T 600 400 T 800 400 T 1000 400"
          stroke="#C77DFF"
          strokeWidth="6"
          fill="none"
          className="pulse-glow"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(199, 125, 255, 0.4))',
          }}
        />
        <path
          d="M 200 450 Q 350 350, 500 450 T 800 450 T 1100 450"
          stroke="#9D7FC7"
          strokeWidth="4"
          fill="none"
          className="pulse-glow"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(157, 127, 199, 0.3))',
            animationDelay: '1s',
          }}
        />
        <circle
          cx="400"
          cy="400"
          r="60"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="3"
          className="pulse-glow"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))',
            animationDelay: '2s',
          }}
        />
        <circle
          cx="700"
          cy="400"
          r="50"
          fill="none"
          stroke="#C77DFF"
          strokeWidth="3"
          className="pulse-glow"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(199, 125, 255, 0.3))',
            animationDelay: '1.5s',
          }}
        />
      </svg>
    </div>
  )
}
