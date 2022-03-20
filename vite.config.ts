import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VantResolver } from 'unplugin-vue-components/resolvers'
// import styleImport from 'vite-plugin-style-import'
import lagacy from '@vitejs/plugin-legacy'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import { resolve } from 'path'
import prismjs from 'vite-plugin-prismjs'
import monacoEditor from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver(), VantResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), VantResolver()],
    }),
    // styleImport({
    //   libs: [
    //     {
    //       libraryName: 'vant',
    //       esModule: true,
    //       resolveStyle: (name) => `vant/es/${name}/style/index`,
    //     },
    //   ],
    // }),
    lagacy({
      targets: ['defaults'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    pwa({
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        /* other options */
      },
      manifest: {
        name: 'Magnifique',
        short_name: 'Magn.',
        description: 'A great management platform.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    prismjs({
      languages: ['javascript', 'css', 'cpp', 'c', 'html', 'typescript', 'java', 'rust', 'go', 'python', 'json', 'yaml', 'graphql', 'markdown'],
      plugins: ['line-numbers', 'copy-to-clipboard'],
      theme: 'default',
      css: true,
    }),
    monacoEditor(),
  ],
  server: {
    fs: {
      strict: false,
    },
    proxy: {
      '/api': 'http://locahost/api',
    },
  },
  build: {
    outDir: './dist/pages',
  },
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: atRule => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            },
          },
        },
      ],
    },
  },
})
