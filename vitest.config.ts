import {resolve} from "path"
import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@app": resolve(__dirname, "src/app"),
      "@content": resolve(__dirname, "src/content"),
      "@dvm": resolve(__dirname, "src/dvm"),
      "@feeds": resolve(__dirname, "src/feeds"),
      "@lib": resolve(__dirname, "src/lib"),
      "@net": resolve(__dirname, "src/net"),
      "@signer": resolve(__dirname, "src/signer"),
      "@store": resolve(__dirname, "src/store"),
      "@util": resolve(__dirname, "src/util"),
    },
  },
})
