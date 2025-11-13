// En: tailwind.config.ts (El Código de Configuración)

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      // --- 1. Conectamos las fuentes del layout.tsx ---
      fontFamily: {
        sans: 'var(--font-family-base)',
        titulo: 'var(--font-family-titulo)',
        especial: 'var(--font-family-especial)',
      },
      // --- 2. Conectamos los colores (que definiremos en el siguiente paso) ---
      colors: {
        'primario-oscuro': 'var(--color-primario-oscuro)',
        'acento': 'var(--color-acento)',
        'secundario-suave': 'var(--color-secundario-suave)',
        'fondo': 'var(--color-fondo)',
        'superficie': 'var(--color-superficie)',
        'texto-principal': 'var(--color-texto-principal)',
        'texto-secundario': 'var(--color-texto-secundario)',
      }
    },
  },
  plugins: [],
}
export default config