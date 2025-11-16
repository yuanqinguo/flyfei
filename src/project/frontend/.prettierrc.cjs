const prettierConfig = require('@byboat/prettier-config')

/** @type {import('prettier').Config} */
module.exports = {
  ...prettierConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.js'
}
