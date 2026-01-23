/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode moderno com lilás e neon
        'dark-bg': '#0E0B14',
        'dark-secondary': '#1A1525',
        'dark-tertiary': '#241B2E',
        'dark-card': '#1F1830',
        'dark-border': '#2D2440',
        'purple-dark': '#3D2A5F',
        'purple-medium': '#5A3F7A',
        'purple-light': '#7A5A9A',
        'lilac': '#9D7FC7',
        'lilac-light': '#B89DD9',
        'neon-purple': '#C77DFF',
        'neon-cyan': '#00F0FF',
        'neon-pink': '#FF6B9D',
        'neon-lime': '#B8FF39',
        'text-primary': '#F5F3FF',
        'text-secondary': '#D4C5E8',
        'text-soft': '#B8A5D1',
        'text-muted': '#8B7AA3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'neon-purple': '0 0 20px rgba(199, 125, 255, 0.4), 0 0 40px rgba(199, 125, 255, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(255, 107, 157, 0.2)',
        'glow-purple': '0 0 15px rgba(199, 125, 255, 0.5)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
