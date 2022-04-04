import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
document.addEventListener('DOMContentLoaded', () => {
  invoke('show_window')
})

try {
  appWindow.setDecorations(false)
} catch (_e) {
  // default
}

export const hideWindow = () => {
  try {
    appWindow.hide()
  } catch (_e) {
    // defaut
  }
}

export const minWindow = () => {
  try {
    appWindow.minimize()
  } catch (_e) {
    // defaut
  }
}

export const maxWindow = () => {
  try {
    appWindow.toggleMaximize()
  } catch (_e) {
    // defaut
  }
}
