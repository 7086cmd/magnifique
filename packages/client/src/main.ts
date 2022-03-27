/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { resolve } from 'path'
import { URL } from 'url'
import analyzePerson from './modules/utils/analyze-person'
import transformDate from './modules/utils/transform-date'
import io from 'socket.io-client'
import { BrowserWindow, app, Tray, Menu, screen, ipcMain, Notification, dialog, shell } from 'electron'
import update from './modules/update'

if (process.env.NODE_ENV !== 'development') {
  update()
}
let socket: any
let connected = false

app.setAppUserModelId('Magnifique')

let tray: Tray

app.setLoginItemSettings({
  openAtLogin: process.env.NODE_ENV === 'production',
})

app.whenReady().then(() => {
  tray = new Tray(process.env.NODE_ENV === 'development' ? resolve(__dirname, '../../icons/client.ico') : resolve(__dirname, '../icons/client.ico'))
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const calc = (num: number) => {
    return Math.floor((num * 5) / 6)
  }
  const mainWindow = new BrowserWindow({
    width: calc(width),
    height: calc(height),
    frame: false,
    show: false,
    webPreferences: {
      preload: resolve(__dirname, process.env.NODE_ENV == 'development' ? './preload.js' : './client.preload.min.js'),
    },
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.loadURL(process.env.NODE_ENV == 'development' ? 'http://localhost:3000/' : 'https://xxxxxxxxx/')
  process.env.NODE_ENV == 'development' && mainWindow.webContents.openDevTools()
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: '打开主界面',
        click: () => mainWindow.show(),
      },
      {
        type: 'separator',
      },
      {
        label: '退出',
        click: () => {
          mainWindow.destroy()
          app.quit()
        },
      },
    ])
  )
  tray.on('double-click', () => mainWindow.show())
  ipcMain.on('describe-notif', (_event, data) => {
    const dt = data
    const iourl = new URL(`ws://` + (process.env.NODE_ENV === 'development' ? 'localhost' : '10.49.8.4') + `?gradeid=${transformDate(data.gradeid)}&classid=${data.classid}&from=class`)
    if (!connected) {
      socket = io(iourl.href)
      connected = true
    }
    socket.on('quit-app', () => {
      dialog.showMessageBoxSync(mainWindow, {
        title: '已经有其他人使用本账号在别处登录',
        message: '现在将要登出。若不是您已确认的操作，请及时修改密码。',
      })
      mainWindow.destroy()
      app.quit()
    })
    socket.on('connect-successfully', () => {
      new Notification({
        title: '已连接',
        body: '已成功连接服务器，如果有消息会第一时间通知',
      }).show()
    })
    socket.on('new-deduc', (data: string) => {
      const d = JSON.parse(data)
      if (analyzePerson(d.person).gradeid == transformDate(dt.gradeid) && analyzePerson(d.person).classid == dt.classid) {
        new Notification({
          title: '有新扣分',
          body: `${d.person}在${d.place}因${d.reason}被扣${d.deduction}分`,
        }).show()
      }
    })
    socket.on('del-deduc', (data: string) => {
      const d = JSON.parse(data)
      if (analyzePerson(d.person).gradeid == transformDate(dt.gradeid) && analyzePerson(d.person).classid == dt.classid) {
        new Notification({
          title: '扣分被删除',
          body: `${d.person}的${d.id}扣分被删除`,
        }).show()
      }
    })
    socket.on('turnd-deduc', (data: string) => {
      const d = JSON.parse(data)
      if (analyzePerson(d.person).gradeid == transformDate(dt.gradeid) && analyzePerson(d.person).classid == dt.classid) {
        new Notification({
          title: '扣分申诉被驳回',
          body: `${d.person}的${d.id}扣分申诉被驳回`,
        }).show()
      }
    })
  })
  mainWindow.on('resized', () => {
    mainWindow.webContents.send('reload-page')
  })
  ipcMain.on('close-main-window', () => {
    mainWindow.hide()
  })
  ipcMain.on('minimize-main-window', () => {
    mainWindow.minimize()
  })
  ipcMain.on('maximize-main-window', () => {
    mainWindow.webContents.send('reload-page')
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  })
  mainWindow.on('close', event => {
    mainWindow.hide()
    event.preventDefault()
  })
})

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reloader')(module)
  // eslint-disable-next-line no-empty
} catch (_e) {}
