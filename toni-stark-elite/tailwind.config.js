export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0a192f",
        neon: "#00f3ff",
        glow: "#00f3ff80",
        gold: "#d4af37",
        redbull: "#e21b4d",
      },
      animation: {
        "fade-in-slow": "fadeIn 2s ease-out forwards",
        "slide-in": "slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-glow": "pulseGlow 2s infinite",
      },
    },
  },
  plugins: [],
}
