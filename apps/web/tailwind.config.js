const preset = require('@swiftpos/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
};
