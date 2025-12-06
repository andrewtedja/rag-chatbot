module.exports = {
	// Fix: Point to actual file locations (app/, components/, not src/)
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				inter: ["var(--font-inter)", "sans-serif"],
				space: ["var(--font-space-grotesk)", "sans-serif"],
				sora: ["var(--font-sora)", "sans-serif"],
			},
		},
	},
	darkMode: "class",
	// Add typography plugin for markdown styling
	plugins: [require.resolve("@tailwindcss/typography")],
};
