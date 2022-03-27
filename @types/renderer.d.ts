export interface magnifique_api {
  closeServer: () => void
  minServerWindow: () => void
  maxServerWindow: () => void
  isElectron: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  networks: any[]
}
declare global {
  interface Window {
    magnifique: magnifique_api
  }
}
