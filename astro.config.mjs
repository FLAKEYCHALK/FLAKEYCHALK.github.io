import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://flakeychalk.github.io",
  integrations: [tailwind(), sitemap()],
  image: {
    service: passthroughImageService()
  }
});
