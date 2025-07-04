import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint", "@pinia/nuxt"],
  components: {
    global: true,
    dirs: ["~/components", "~/components/layout"],
  },
  runtimeConfig: {
    // Private keys (only available on the server side)
    djangoApiUrl: process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api",
    // Public keys (exposed to the client side)
    public: {
      // Add public env vars here if needed
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
