/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        dark: {
          900: 'var(--theme-bgPrimary, #0a0a0a)',
          800: 'var(--theme-bgSecondary, #111111)',
          700: 'var(--theme-bgCard, #1a1a1a)',
          600: 'var(--theme-bgHover, #222222)',
          500: '#2a2a2a',
        },
        accent: {
          green: 'var(--theme-primary, #00d4aa)',
          orange: 'var(--theme-accent, #ff6b35)',
        },
        theme: {
          primary: 'var(--theme-primary, #3B82F6)',
          secondary: 'var(--theme-secondary, #10B981)',
          accent: 'var(--theme-accent, #F59E0B)',
          success: 'var(--theme-success, #10B981)',
          error: 'var(--theme-error, #EF4444)',
          warning: 'var(--theme-warning, #F59E0B)',
          buy: 'var(--theme-buyColor, #3B82F6)',
          sell: 'var(--theme-sellColor, #EF4444)',
          profit: 'var(--theme-profitColor, #10B981)',
          loss: 'var(--theme-lossColor, #EF4444)',
        },
        bluestone: {
          deep: '#0B1A2E',
          royal: '#2F7FB5',
          accent: '#3E90C2',
          light: '#5FAED6',
          dark: '#0A0E1A',
          silver: '#CFCFCF',
        },
        gold: {
          dark: '#B9974B',
          DEFAULT: '#CFAF63',
          light: '#E6D6A3',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
        'rainbow': 'rainbow 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'ticker': 'ticker 30s linear infinite',
        'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'rainbow': {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '400% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(62, 144, 194, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(62, 144, 194, 0.6)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(62, 144, 194, 0.3)',
        'glow-lg': '0 0 60px rgba(62, 144, 194, 0.4), 0 0 120px rgba(62, 144, 194, 0.2)',
        'glow-blue': '0 0 20px rgba(62, 144, 194, 0.5)',
        'glow-gold': '0 0 20px rgba(207, 175, 99, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #0B1A2E 0%, #2F7FB5 50%, #5FAED6 100%)',
        'gradient-gold': 'linear-gradient(90deg, #B9974B, #CFAF63, #E6D6A3)',
      },
    },
  },
  plugins: [],
}
