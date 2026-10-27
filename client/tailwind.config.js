/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          dark: '#0a0b14',
          card: '#121424',
          cardHover: '#181b32',
          border: '#232847',
          neonCyan: '#00f2fe',
          neonPurple: '#9d4edd',
          neonPink: '#ff007f',
          neonEmerald: '#00f59b',
          neonYellow: '#ffbe0b',
        }
      },
      fontFamily: {
        gaming: ['"Outfit"', '"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.45)',
        'neon-purple': '0 0 20px -3px rgba(157, 78, 221, 0.45)',
        'neon-pink': '0 0 20px -3px rgba(255, 0, 127, 0.45)',
        'neon-emerald': '0 0 20px -3px rgba(0, 245, 155, 0.45)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 3s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
