const config = {
  plugins: [require('tailwind-scrollbar-hide')]
};
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [require('flowbite/plugin')],
}


export default config;