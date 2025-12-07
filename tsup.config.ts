import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react/index': 'src/react/index.tsx',
    'vanilla/index': 'src/vanilla/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
  // Create a browser-friendly build for vanilla JS
  esbuildOptions(options: any) {
    options.target = 'es2020'
  },
})
