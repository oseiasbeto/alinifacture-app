/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.vue"],
theme: {
    extend: {
      colors: {
        primary: '#2563eb',     // azul moderno
        primaryDark: '#1d4ed8',
        accent: '#10b981',      // verde sucesso/finanças
        neutral: {
          50: '#f9fafb',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}

