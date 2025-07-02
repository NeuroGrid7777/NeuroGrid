/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'monospace'],
        'futuristic': ['Rajdhani', 'sans-serif'],
        'tech': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'terminal': 'terminal 0.5s ease-out',
        'draw': 'draw 2s ease-out',
        'fadeInUp': 'fadeInUp 0.8s ease-out',
        'slideInLeft': 'slideInLeft 1s ease-out',
        'slideInRight': 'slideInRight 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff' },
          '100%': { boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff' },
        },
        terminal: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      colors: {
        'neural-blue': '#00ffff',
        'neural-purple': '#8b5cf6',
        'neural-pink': '#ec4899',
        'deep-space': '#0a0a0f',
        'neural-green': '#10b981',
      },
      backgroundImage: {
        'neural-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      },
    },
  },
  plugins: [],
};