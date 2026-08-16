import { defineConfig } from 'tsdown'

export default defineConfig({
  // Generate TypeScript declaration files
  dts: {
    tsgo: true,
  },
  exports: true,  // Define the package's public entry points
  clean: true,    // Remove previous build output before building
  minify: true,   // Minify the emitted JavaScript
})
