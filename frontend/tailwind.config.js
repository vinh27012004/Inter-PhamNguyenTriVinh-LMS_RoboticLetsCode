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
    },
  },
  plugins: [],
}
