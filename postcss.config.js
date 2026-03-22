/**
 * PostCSS Configuration
 * Configures PostCSS to use Tailwind CSS and Autoprefixer.
 */
export default {
    plugins: {
        '@tailwindcss/postcss': {}, // Tailwind CSS v4 plugin
        autoprefixer: {},           // Adds vendor prefixes for browser compatibility
    },
}
