/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Remapped to gallery palette
        parchment: '#f0eae1',         // gallery ivory-dark
        cream: '#faf6f1',             // gallery ivory
        pine: {
          DEFAULT: '#2c2825',         // gallery ink (warm near-black)
          dark: '#1a1612',            // deep warm dark
          light: '#b8976a',           // gallery gold (accent)
        },
        ember: {
          DEFAULT: '#c97b6b',         // gallery terracotta
          dark: '#a85e50',            // deeper terracotta
        },
        brass: '#b8976a',             // gallery gold
        'brass-dark': '#9a7d55',      // darker gold for hover
        charcoal: '#2c2825',          // gallery ink
        mist: '#e6ddd5',              // gallery border
        // Gallery extras
        gold: '#b8976a',
        'gold-light': '#d4bf9a',
        'gold-wash': '#f5efe6',
        blush: '#c4a0a0',
        'blush-light': '#e8d5d5',
        sage: '#8b9a7b',
        'sage-wash': '#eef1eb',
        ivory: '#faf6f1',
        surface: '#fffefb',
        ink: '#2c2825',
        border: '#e6ddd5',
        muted: '#9a918a',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(44,40,37,0.06), 0 8px 24px -12px rgba(44,40,37,0.14)',
        lift: '0 12px 40px -12px rgba(44,40,37,0.22)',
      },
      backgroundImage: {
        'paper-grain':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.9s ease both',
      },
    },
  },
  plugins: [],
};
