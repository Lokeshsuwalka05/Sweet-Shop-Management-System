/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // Enable DaisyUI component classes (e.g., `footer`, `bg-base-200`, `link-hover`)
    require("daisyui"),
  ],
  // Optional: configure DaisyUI themes or settings
  daisyui: {
    themes: ["light", "dark"],
  },
};
