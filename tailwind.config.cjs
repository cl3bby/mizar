/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		screens: {
			sm: "540px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			borderRadius: {
				"4xl": "2rem",
				"5xl": "3rem",
				"6xl": "4rem",
				"7xl": "5rem",
			},
			colors: {
				black: "#153834",
				brand: {
					dark: "#153834",
					light: "#d8e4de",
					accent: "#bd8d43",
				},
			},
			fontFamily: {
				display: ["Midnight", ...defaultTheme.fontFamily.sans],
				sans: ["InterVariable", ...defaultTheme.fontFamily.sans],
				mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
			},
		},
	},
	safelist: [
		{
			pattern: /row-start-\d+/,
			variants: ["md"],
		},
	],
	plugins: [
		require.resolve("prettier-plugin-astro"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("@tailwindcss/aspect-ratio"),
	],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
};
