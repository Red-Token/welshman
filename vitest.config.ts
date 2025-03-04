import {resolve} from "path"
import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: "./vitest.setup.ts",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@red-token/welshman/app": resolve(__dirname, "src/app"),
      "@red-token/welshman/content": resolve(__dirname, "src/content"),
      "@red-token/welshman/dvm": resolve(__dirname, "src/dvm"),
      "@red-token/welshman/feeds": resolve(__dirname, "src/feeds"),
      "@red-token/welshman/lib": resolve(__dirname, "src/lib"),
      "@red-token/welshman/net": resolve(__dirname, "src/net"),
      "@red-token/welshman/signer": resolve(__dirname, "src/signer"),
      "@red-token/welshman/store": resolve(__dirname, "src/store"),
      "@red-token/welshman/util": resolve(__dirname, "src/util"),
    },
  },
})
