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
        // Màu chủ đạo Purple (từ textmamau.txt)
        brandPurple: {
          50:  '#e5caf2',      // light pastel purple
          200: '#d897f6',      // light medium purple
          300: '#c25af3',      // purple
          400: '#b327f5',      // medium purple
          600: '#9c00e5',      // dark purple
        },
        // Màu vàng (từ textmamau.txt)
        brandYellow: {
          50:  '#fdf9db',
          100: '#fef7b8',
          200: '#fff282',
          300: '#ffec4a',
          500: '#ffe400',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(30px, -40px) rotate(5deg)' },
          '50%': { transform: 'translate(0px, -60px) rotate(0deg)' },
          '75%': { transform: 'translate(-30px, -40px) rotate(-5deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
        driftSlow: {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(-40px, -30px) rotate(-8deg)' },
          '50%': { transform: 'translate(0px, -50px) rotate(0deg)' },
          '75%': { transform: 'translate(40px, -30px) rotate(8deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '33%': { transform: 'translateX(20px) translateY(-30px)' },
          '66%': { transform: 'translateX(-20px) translateY(-20px)' },
        },
        roam: {
          '0%': { transform: 'translate(-5vw, -2vh) rotate(-3deg)' },
          '25%': { transform: 'translate(10vw, -8vh) rotate(3deg)' },
          '50%': { transform: 'translate(18vw, 6vh) rotate(-2deg)' },
          '75%': { transform: 'translate(-4vw, 12vh) rotate(3deg)' },
          '100%': { transform: 'translate(-5vw, -2vh) rotate(-3deg)' },
        },
        roamSlow: {
          '0%': { transform: 'translate(4vw, 8vh) rotate(2deg)' },
          '25%': { transform: 'translate(-12vw, 4vh) rotate(-3deg)' },
          '50%': { transform: 'translate(8vw, -6vh) rotate(2deg)' },
          '75%': { transform: 'translate(14vw, 10vh) rotate(-2deg)' },
          '100%': { transform: 'translate(4vw, 8vh) rotate(2deg)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        drift: 'drift 8s ease-in-out infinite',
        driftSlow: 'driftSlow 10s ease-in-out infinite',
        sway: 'sway 6s ease-in-out infinite',
        roam: 'roam 16s ease-in-out infinite',
        roamSlow: 'roamSlow 20s ease-in-out infinite',
      },
      position: {
        sticky: 'sticky',
      },
    },
  },
  plugins: [],
}
