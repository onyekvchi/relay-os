// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  ssr: false,
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false
  },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/ui', 'pinia-plugin-persistedstate/nuxt', '@nuxtjs/google-fonts'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      enableMSW: process.env.NUXT_PUBLIC_ENABLE_MSW !== 'false' // Default to true in dev
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  imports: {
    dirs: ['stores', 'composables', 'composables/api']
  },
  app: {
    head: {
      title: 'Relay OS',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'description', content: 'Request management and automation for corporates' },
        { name: 'theme-color', content: '#000' }
      ]
    }
  },
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700]
    }
  }
});