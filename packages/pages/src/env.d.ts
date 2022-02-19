/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_ENV_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'particles.vue3'

// declare module 'vue' {
//     import { CompatVue } from '@vue/runtime-dom'
//     const Vue: CompatVue
//     export default Vue
//     export * from '@vue/runtime-dom'
// }

declare type status1 =
  | {
      status: 'ok'
      details: {
        id: string
      }
    }
  | {
      status: 'error'
      reason: string
      text: string
    }
