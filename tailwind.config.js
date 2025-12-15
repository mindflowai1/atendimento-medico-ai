/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#2dd4bf', // teal-400
                    DEFAULT: '#0d9488', // teal-600
                    dark: '#115e59', // teal-800
                },
                secondary: {
                    light: '#60a5fa', // blue-400
                    DEFAULT: '#2563eb', // blue-600
                    dark: '#1e40af', // blue-800
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
