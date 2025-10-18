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
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ||
        "https://inuinouta-front-v3.vercel.app",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // SEO設定
  app: {
    keepalive: true, // ページの状態を保持
    head: {
      htmlAttrs: {
        lang: "ja",
        prefix: "og: http://ogp.me/ns#",
      },
      title: "いぬいのうた | 戌亥とこ非公式ファンサイト",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "いぬいのうたは、にじさんじ所属のバーチャルライバーである戌亥とこさんを応援するファンサイトです。戌亥とこさんが歌った楽曲を探しやすく、再生しやすいようにまとめています。",
        },
        {
          name: "keywords",
          content:
            "戌亥とこ,ケルベロス,にじさんじ,歌,歌ってみた,バーチャルYouTuber,Vtuber,いぬいのうた,YouTube",
        },
        {
          name: "google-site-verification",
          content: "ET167zHrokrdV7LkyXTpcLWAysh2k145WpWB4XkXRQc",
        },
        // Open Graph
        { property: "og:type", content: "website" },
        {
          property: "og:url",
          content: "https://inuinouta-front-v3.vercel.app/",
        },
        {
          property: "og:title",
          content: "いぬいのうた | 戌亥とこ非公式ファンサイト",
        },
        {
          property: "og:description",
          content:
            "いぬいのうたは、にじさんじ所属のバーチャルライバーである戌亥とこさんを応援するファンサイトです。戌亥とこさんが歌った楽曲を探しやすく、再生しやすいようにまとめています。",
        },
        {
          property: "og:image",
          content: "https://inuinouta-front-v3.vercel.app/og-image.png",
        },
        // Twitter Card
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "いぬいのうた | 戌亥とこ非公式ファンサイト",
        },
        {
          name: "twitter:description",
          content:
            "いぬいのうたは、にじさんじ所属のバーチャルライバーである戌亥とこさんを応援するファンサイトです。戌亥とこさんが歌った楽曲を探しやすく、再生しやすいようにまとめています。",
        },
        {
          name: "twitter:image",
          content: "https://inuinouta-front-v3.vercel.app/og-image.png",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          href: "/icon-192x192.png",
          sizes: "192x192",
        },
        { rel: "manifest", href: "/manifest.json" },
      ],
    },
  },
});
