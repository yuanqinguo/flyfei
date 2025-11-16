/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f2a16b',
        info: '#2d8cf0',
        success: '#19be6b',
        warning: '#f90',
        error: '#f16543',
        title: '#272e3b',
        content: '#4e5969',
        sub: '#86909c',
        icon: '#ced0de',
        disabled: '#d8dae5',
        border: '#e1e6eb',
        background: '#fafbff',
        pageBackground: '#fafbff',
        white: '#fff'
      }
    }
  },
  plugins: []
}
