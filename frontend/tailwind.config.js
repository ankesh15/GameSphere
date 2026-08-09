/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      },
      colors: {
        obsidian: {
          950: "#060913",
          900: "#0b101d",
          850: "#0f172a"
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95"
        },
        live: {
          amber: "#f59e0b",
          orange: "#ff6b00",
          400: "#ff9e43",
          500: "#ff6b00",
          600: "#e65100"
        },
        game: {
          discord: "#5865f2",
          steam: "#171a21",
          valorant: "#ff4655",
          xbox: "#107c10",
          playstation: "#003087"
        }
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-live": "pulseLive 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear"
      },
      keyframes: {
        pulseLive: {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 15px rgba(255, 107, 0, 0.4)" },
          "50%": { opacity: 0.7, boxShadow: "0 0 5px rgba(255, 107, 0, 0.1)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};
