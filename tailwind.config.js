/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.{html,ejs}"],
    theme: {
      extend: {
        colors: {
          primary: '#FF385C',
          secondary: '#222222',
          accent: '#FFBFAE',
          background: '#F7F7F7',
          airred: '#E31C5F',
          textmain: '#484848',
          bordergray: '#DDDDDD'
        },
      },
    },
    plugins: [],
  }