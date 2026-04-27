import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        zpath: {
          primary: '#1DA1F2',   // Xanh dương
          secondary: '#7B2CBF', // Tím
          accent: '#22D3EE',    // Xanh Cyan
          dark: '#0B1F3A',      // Đen xanh đậm
        }
      },
      backgroundImage: {
        'zpath-gradient': 'linear-gradient(to right, #1DA1F2, #7B2CBF)',
      },
    },
  },
  plugins: [],
}
export default config