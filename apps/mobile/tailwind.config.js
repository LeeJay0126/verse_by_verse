/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        parchment: "#f6efe4",
        cream: "#fffaf3",
        sand: "#efe3d3",
        ink: "#2d2018",
        walnut: "#4d3929",
        taupe: "#7a6553",
        amber: "#8f6840",
        line: "rgba(127, 90, 54, 0.12)",
        lineStrong: "rgba(127, 90, 54, 0.18)",
        danger: "#a12626",
      },
      boxShadow: {
        soft: "0 16px 32px rgba(45, 32, 24, 0.08)",
      },
      fontFamily: {
        body: ["PlayfairDisplay_400Regular"],
        display: ["PlayfairDisplay_600SemiBold"],
        displayBold: ["PlayfairDisplay_700Bold"],
      },
    },
  },
  plugins: [],
};