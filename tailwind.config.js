// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-green': '#00ff00',
        'cyber-dark-green': '#003300',
        'cyber-blue': '#00ffff',
        'terminal-black': '#000000',
        'terminal-dark': '#0f1117',
      },
      fontFamily: {
        'cyber': ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}