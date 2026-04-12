export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        testcolor: "red",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
