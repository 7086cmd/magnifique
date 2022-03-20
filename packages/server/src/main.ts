// import based-on dependences
import koaCors from '@koa/cors'
import koaMulter, { diskStorage } from '@koa/multer'
import KoaRouter from '@koa/router'
import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from 'electron'
import { readFileSync } from 'fs'
import { createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import { encode as encodeGBK } from 'iconv-lite'
// import server dependences
import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import koaStatic from 'koa-static'
import koaSslify from 'koa-sslify'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { Server } from 'socket.io'
import { URLSearchParams } from 'url'
import { v4 } from 'uuid'
// import admin productions
import loginAdmin from './modules/admin/login-admin'
import resetPassword from './modules/admin/reset-password'
import editPassword from './modules/class/edit-password'
// import class productions
import loginClass from './modules/class/login-class'
import allowPowers from './modules/database/allow-powers'
import { readData, writeData } from './modules/database/config'
// import data
import dbCreate from './modules/database/db-create'
import getDepartmentData from './modules/database/get-department-data'
import getPublicPower from './modules/database/get-public-power'
import networks from './modules/database/networks'
// import member productions
import loginMember from './modules/member/login-member'
import newPassword from './modules/member/new-password'
import * as deductionActions from './modules/powers/deduction'
import * as memberActions from './modules/powers/member'
// Refactor: import uses
import * as postActions from './modules/powers/post'
import * as volunteerActions from './modules/powers/volunteer'
import * as utils from './modules/utils'
import getEmailConfig from './modules/database/get-email-config'
import getOrigin from './modules/database/get-origin'
import createIndex from './modules/im/utils/create-index'

// Generate Chart Base File
const chartBase = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link rel="shortcut icon" href="https://v-charts.js.org/favicon.ico" type="image/x-icon" /><title>Chart (type: <%=tit=>)</title><script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script><script src="https://cdn.jsdelivr.net/npm/echarts@4/dist/echarts.min.js"></script><script src="https://cdn.jsdelivr.net/npm/v-charts/lib/index.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/v-charts/lib/style.min.css" /></head><body><div id="app"><ve-<%=tpe=> :data="cdata"></ve-<%=tpe=>></div><script>var vm=new Vue({el:'#app',data(){const data=JSON.parse('<%=dat=>');return {cdata:data}}})</script></body></html>`
let tray: Tray
let csvTokens: Record<string, string> = {}
let docTokens: Record<string, Buffer> = {}
let graphTokens: Record<
  string,
  {
    columns: string[]
    rows: Record<string, number | string>[]
  }
> = {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & KoaRouter.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, any>

// Initializate Server.
const server = new Koa()
const downloaderServer = new Koa()
const router = new KoaRouter()
const downloadRouter = new KoaRouter()
let callBacks =
  process.env.NODE_ENV === 'production'
    ? new Koa()
        .use(async ctx => {
          const url = ctx.URL
          url.protocol = 'https'
          ctx.redirect(url.toString())
        })
        .callback()
    : server.callback()
const httpServer = createHttpServer(callBacks)
const httpsServer = createHttpsServer(
  {
    key: readFileSync(resolve(tmpdir(), '..', 'magnifique', 'ssl', 'server.key')),
    cert: readFileSync(resolve(tmpdir(), '..', 'magnifique', 'ssl', 'server.pem')),
  },
  server.callback()
)
const downloaderSecureServer = createHttpsServer(
  {
    key: readFileSync(resolve(tmpdir(), '..', 'magnifique', 'ssl', 'server.key')),
    cert: readFileSync(resolve(tmpdir(), '..', 'magnifique', 'ssl', 'server.pem')),
  },
  downloaderServer.callback()
)
const downloaderUnSecureServer = createHttpServer(downloaderServer.callback())
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['magnifique'],
    credentials: true,
  },
})
const uploader = koaMulter({
  storage: diskStorage({
    destination: resolve(tmpdir(), '../magnifique/posts'),
    filename: (_ctx, file, cb) => {
      cb(null, file.originalname)
    },
  }),
  fileFilter: (_ctx, file, cb) => {
    const filename = file.originalname.split('.').reverse()
    if (filename[0] == 'docx') {
      cb(null, true)
    } else {
      cb(null, false)
    }
  },
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB for limit.
    files: 1,
  },
})
server.use(koaBodyparser())

// Generate a get-password way for `get-method`
const getPassword = (ctx: context) => {
  // I really don't want to let them in (Look, UP!)
  const params = new URLSearchParams(ctx.querystring)
  const password = params.get('password')
  if (password == null) {
    throw 'No this item!'
  } else {
    return password
  }
}

// Create Database(if not exists)
dbCreate()
writeData(networks())

// Serve Static File(Front End)
if (process.env.NODE_ENV === 'production') {
  server.use(koaStatic(resolve(__dirname, './pages')))
  server.use(koaSslify())
  router.get('/docs/:filename', async ctx => {
    ctx.response.body = readFileSync(resolve(__dirname, './docs/', ctx.params.filename)).toString()
  })
} else {
  // For safety, we don't allow to use `koaCors` in production.
  server.use(koaCors({}))
}
downloadRouter.get('/', async ctx => {
  ctx.response.body = ctx
})
downloadRouter.get('/api/class/graph/:type/:token', async ctx => {
  if (graphTokens[ctx.params.token] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
    return
  } else {
    const { type, token } = ctx.params
    ctx.response.body = chartBase
      .split('<%=tit=>')
      .join(type)
      .split('<%=tpe=>')
      .join(type)
      .split('<%=dat=>')
      .join(JSON.stringify(graphTokens[token as string]))
  }
})
downloadRouter.get('/api/admin/export/download/:token', async ctx => {
  if (csvTokens[ctx.params.token] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
    return
  } else {
    ctx.response.type = 'csv'
    ctx.response.body = encodeGBK(csvTokens[ctx.params.token], 'gbk')
    delete csvTokens[ctx.params.token]
  }
})
downloadRouter.get('/api/member/post/download/:id/:docName', async ctx => {
  if (docTokens[ctx.params.id] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
  } else {
    ctx.response.type = 'docx'
    ctx.response.body = docTokens[ctx.params.id]
    delete docTokens[ctx.params.id]
  }
})

downloadRouter.get('/api/class/graph/:type/:token', async ctx => {
  if (graphTokens[ctx.params.token] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
    return
  } else {
    const { type, token } = ctx.params
    ctx.response.body = chartBase
      .split('<%=tit=>')
      .join(type)
      .split('<%=tpe=>')
      .join(type)
      .split('<%=dat=>')
      .join(JSON.stringify(graphTokens[token as string]))
  }
})
router.get('/api/admin/export/download/:token', async ctx => {
  if (csvTokens[ctx.params.token] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
    return
  } else {
    ctx.response.type = 'csv'
    ctx.response.body = encodeGBK(csvTokens[ctx.params.token], 'gbk')
    delete csvTokens[ctx.params.token]
  }
})
router.get('/api/member/post/download/:id/:docName', async ctx => {
  if (docTokens[ctx.params.id] === undefined) {
    ctx.response.type = 'html'
    ctx.response.body = '<p>未找到</p>'
  } else {
    ctx.response.type = 'docx'
    ctx.response.body = docTokens[ctx.params.id]
    delete docTokens[ctx.params.id]
  }
})
// Class APIs
router.get('/api/class/:gradeid/:classid/login', async ctx => {
  const params = new URLSearchParams(ctx.querystring)
  const password = params.get('password')
  const { gradeid, classid } = ctx.params
  ctx.response.type = 'json'
  ctx.response.body = loginClass(parseInt(gradeid), parseInt(classid), String(password))
})
router.get('/api/class/:gradeid/:classid/member/get', async ctx => {
  try {
    const password = getPassword(ctx)
    const { gradeid, classid } = ctx.params
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      const members = memberActions.getClassAsRaw(parseInt(gradeid), parseInt(classid)).details
      ctx.response.body = memberActions.multiProcess({
        status: 'ok',
        details: members,
      })
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/class/:gradeid/:classid/get/deduction', async ctx => {
  const params = new URLSearchParams(ctx.querystring)
  const password = params.get('password')
  const { gradeid, classid } = ctx.params
  if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
    ctx.response.body = deductionActions.getClass(parseInt(gradeid), parseInt(classid))
  } else {
    ctx.response.body = {
      status: 'error',
      reason: 'password-error',
    }
  }
})
router.get('/api/class/:gradeid/:classid/get/post', async ctx => {
  const params = new URLSearchParams(ctx.querystring)
  const password = params.get('password')
  const { gradeid, classid } = ctx.params
  if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
    ctx.response.body = postActions.getClass(parseInt(gradeid), parseInt(classid))
  } else {
    ctx.response.body = {
      status: 'error',
      reason: 'password-error',
    }
  }
})
router.get('/api/class/:gradeid/:classid/get/volunteer', async ctx => {
  const params = new URLSearchParams(ctx.querystring)
  const password = params.get('password')
  const { gradeid, classid } = ctx.params
  if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
    ctx.response.body = volunteerActions.getVolunteerAsClass(parseInt(gradeid), parseInt(classid))
  } else {
    ctx.response.body = {
      status: 'error',
      reason: 'password-error',
    }
  }
})
router.post('/api/class/new/feedback', async ctx => {
  try {
    const { gradeid, classid, password } = ctx.request.body
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      ctx.response.body = deductionActions.createCallback(ctx.request.body)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/class/graph/:gradeid/:classid/:start/:end/:type/person', async ctx => {
  try {
    const password = getPassword(ctx)
    const { gradeid, classid, start, end } = ctx.params
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      const chartData = deductionActions.graphAsPerson(parseInt(gradeid), parseInt(classid), start, end)
      let id = v4()
      while (graphTokens[id] !== undefined) {
        id = v4()
      }
      graphTokens[id] = chartData
      ctx.response.body = {
        status: 'ok',
        details: {
          token: id,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/class/graph/:gradeid/:classid/:start/:end/:type/reason', async ctx => {
  try {
    const password = getPassword(ctx)
    const { gradeid, classid, start, end } = ctx.params
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      const chartData = deductionActions.graphAsReason(parseInt(gradeid), parseInt(classid), start, end)
      let id = v4()
      while (graphTokens[id] !== undefined) {
        id = v4()
      }
      graphTokens[id] = chartData
      ctx.response.body = {
        status: 'ok',
        details: {
          token: id,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/class/graph/:gradeid/:classid/:start/:end/:type/date', async ctx => {
  try {
    const password = getPassword(ctx)
    const { gradeid, classid, start, end } = ctx.params
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      const chartData = deductionActions.graphAsDate(parseInt(gradeid), parseInt(classid), start, end)
      let id = v4()
      while (graphTokens[id] !== undefined) {
        id = v4()
      }
      graphTokens[id] = chartData
      ctx.response.body = {
        status: 'ok',
        details: {
          token: id,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/class/member/regist', async ctx => {
  try {
    const { gradeid, classid, password, member } = ctx.request.body
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      ctx.response.body = memberActions.createMember(member)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/class/edit/password', async ctx => {
  try {
    const password = ctx.request.body.password
    const { gradeid, classid, newp } = ctx.request.body
    if (loginClass(parseInt(gradeid), parseInt(classid), String(password)).status == 'ok') {
      ctx.response.body = editPassword(gradeid, classid, utils.createDEBase64(newp))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/class/create/volunteer', async ctx => {
  try {
    const { password, gradeid, classid, volunteer } = ctx.request.body as {
      password: string
      gradeid: number
      classid: number
      volunteer: VolunteerMulti
    }
    volunteer.status = 'planning'
    if (loginClass(gradeid, classid, password).status == 'ok') {
      ctx.response.body = volunteerActions.createVolunteerMulti(volunteer as VolunteerMulti)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/class/export/volunteer', async ctx => {
  try {
    const { password, gradeid, classid, config } = ctx.request.body as {
      password: string
      gradeid: number
      classid: number
      config?: {
        start: string
        end: string
      }
    }
    if (loginClass(gradeid, classid, password).status == 'ok') {
      const token = v4()
      csvTokens[token] = volunteerActions.exportData.exportAsClass(gradeid, classid, config)
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// Member APIs
router.get('/api/member/getinfo/:person', async ctx => {
  try {
    const { person } = ctx.params
    ctx.response.body = {
      status: 'ok',
      details: memberActions.singleProcess(memberActions.getSingleMemberAsRaw(parseInt(person)).details as member),
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/getinfo/:id/raw', async ctx => {
  try {
    const { id } = ctx.params
    ctx.response.body = memberActions.getSingleMemberAsRaw(parseInt(id))
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/:id/login', async ctx => {
  try {
    const password = getPassword(ctx)
    const { id } = ctx.params
    ctx.response.body = loginMember(parseInt(id), password)
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// 青志部管理义工可用
router.get('/api/member/admin/:id/get/core/volunteer', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(parseInt(ctx.params.id), 'volunteer')) {
        ctx.response.body = volunteerActions.getVolunteerAsCore()
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/admin/:id/get/core/member', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(parseInt(ctx.params.id), 'volunteer')) {
        ctx.response.body = memberActions.multiProcess(memberActions.getCoreAsRaw())
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
// Member Admin API (Member)
router.post('/api/member/admin/trans/member', async ctx => {
  try {
    const { password, member, number, position } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member')) {
        ctx.response.body = memberActions.editPosition(parseInt(member), position)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/del/member', async ctx => {
  try {
    const { password, person, number } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member')) {
        ctx.response.body = memberActions.deleteMember(parseInt(person))
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/vio/member', async ctx => {
  try {
    const { password, person, number } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member')) {
        memberActions.createNewViolation(parseInt(person), 1)
        ctx.response.body = { status: 'ok' }
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/new/member', async ctx => {
  try {
    const { password, number, member } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member')) {
        ctx.response.body = memberActions.createMember(member)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/admin/:id/get/:department/member', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'member-volunteer')) {
        ctx.response.body = memberActions.multiProcess(memberActions.getDepartmentAsRaw(ctx.params.department))
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// Admin Volunteer APIs.(Member-admin)
router.get('/api/member/admin/:id/get/:department/volunteer', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'member-volunteer')) {
        ctx.response.body = volunteerActions.getVolunteerAsDepartment(ctx.params.department)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/create/volunteer', async ctx => {
  try {
    const { password, number, volunteer } = ctx.request.body as {
      password: string
      number: number
      volunteer: VolunteerMulti
    }
    if (loginMember(number, password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member-volunteer') || memberActions.memberAdminLimitCheckPower(number, 'volunteer')) {
        ctx.response.body = volunteerActions.createVolunteerMulti(volunteer as VolunteerMulti)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/delete/volunteer', async ctx => {
  try {
    const { password, volunteerInfo, number } = ctx.request.body as {
      password: string
      volunteerInfo: {
        person: number[]
        id: string
      }
      number: number
    }
    const { id, person } = volunteerInfo
    if (loginMember(number, password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member-volunteer') || memberActions.memberAdminLimitCheckPower(number, 'volunteer')) {
        ctx.response.body = volunteerActions.deleteVolunteerMulti(id, person)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/edit/volunteer', async ctx => {
  try {
    const { password, volunteerInfo, number } = ctx.request.body as {
      password: string
      volunteerInfo: {
        person: number[]
        id: string
        status: volunteer['status']
      }
      number: number
    }
    const { id, person } = volunteerInfo
    if (loginMember(number, password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member-volunteer') || memberActions.memberAdminLimitCheckPower(number, 'volunteer')) {
        ctx.response.body = volunteerActions.editVolunteerStatusMulti(person, id)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/export/volunteer', async ctx => {
  try {
    const { password, number, config, department, type } = ctx.request.body as {
      password: string
      number: number
      config?: {
        start: string
        end: string
      }
      department: string
      type: 'department' | 'all'
    }
    if (loginMember(number, password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(number, 'member-volunteer') || memberActions.memberAdminLimitCheckPower(number, 'volunteer')) {
        const token = v4()
        if (type === 'all') {
          if (memberActions.memberAdminLimitCheckPower(number, 'volunteer')) {
            csvTokens[token] = volunteerActions.exportData.exportAsAll(config)
          } else {
            ctx.response.body = {
              status: 'error',
              reason: 'no-auth',
            }
          }
        } else csvTokens[token] = volunteerActions.exportData.exportAsDepartment(department, config)
        ctx.response.body = {
          status: 'ok',
          details: {
            token,
          },
        }
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

router.post('/api/member/:id/edit/password', async ctx => {
  try {
    const { password } = ctx.request.body
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      ctx.response.body = newPassword(parseInt(id), utils.createDEBase64(ctx.request.body.newp))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/:id/workflow/get', async ctx => {
  try {
    const password = getPassword(ctx)
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      ctx.response.body = memberActions.readWorkflow(parseInt(id))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/workflow/new', async ctx => {
  try {
    const { password } = ctx.request.body
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      let detail = ctx.request.body
      delete detail['password']
      ctx.response.body = memberActions.createWorkflow(parseInt(id), detail)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/workflow/pause', async ctx => {
  try {
    const { password, id } = ctx.request.body
    const { id: num } = ctx.params
    if (loginMember(parseInt(num), password).status == 'ok') {
      ctx.response.body = memberActions.editWorkflow(parseInt(num), id, 'planning')
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/workflow/finish', async ctx => {
  try {
    const { password, id } = ctx.request.body
    const { id: num } = ctx.params
    if (loginMember(parseInt(num), password).status == 'ok') {
      ctx.response.body = memberActions.editWorkflow(parseInt(num), id, 'success')
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/workflow/start', async ctx => {
  try {
    const { password, id } = ctx.request.body
    const { id: num } = ctx.params
    if (loginMember(parseInt(num), password).status == 'ok') {
      ctx.response.body = memberActions.editWorkflow(parseInt(num), id, 'working')
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/workflow/quit', async ctx => {
  try {
    const { password, id } = ctx.request.body
    const { id: num } = ctx.params
    if (loginMember(parseInt(num), password).status == 'ok') {
      ctx.response.body = memberActions.editWorkflow(parseInt(num), id, 'depracted')
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/member/:id/volunteer/get', async ctx => {
  try {
    const password = new URLSearchParams(ctx.querystring).get('password')
    if (loginMember(Number(ctx.params.id), password as string).status == 'ok') {
      ctx.response.body = volunteerActions.getVolunteerAsOwn(Number(ctx.params.id))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/volunteer/create', async ctx => {
  try {
    const { password, number, volunteer } = ctx.request.body as {
      password: string
      number: number
      volunteer: volunteer
    }
    volunteer.status = 'planning'
    if (loginMember(number, password).status == 'ok') {
      ctx.response.body = volunteerActions.createVolunteer(number, volunteer)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/volunteer/delete', async ctx => {
  try {
    const { password, id, number } = ctx.request.body as {
      password: string
      id: string
      number: number
    }
    if (loginMember(number, password).status == 'ok') {
      ctx.response.body = volunteerActions.deleteVolunteer(number, id)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/:id/volunteer/export', async ctx => {
  try {
    const { password, number, config } = ctx.request.body as {
      password: string
      number: number
      config?: {
        start: string
        end: string
      }
    }
    if (loginMember(number, password).status == 'ok') {
      const token = v4()
      csvTokens[token] = volunteerActions.exportData.exportAsOwn(number, config)
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// 纪检部可用API
router.get('/api/member/admin/:id/get/all/deduction', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.getAll()
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/:id/del/deduction', async ctx => {
  try {
    const { password } = ctx.request.body
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.deleteDeduction(parseInt(ctx.request.body.person), ctx.request.body.id)
        io.emit('deduction', {
          sendTo: [
            'member/' + ctx.request.body.person,
            createIndex({
              ...utils.createPersonNumberAnalyzor(Number(ctx.request.body.person)),
              type: 'class',
            }),
          ],
          content: ctx.request.body.person + '的一个扣分被删除',
          id: ctx.request.body.id,
          type: 'deduction',
          action: 'delete',
        })
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

router.get('/api/member/deduction/:id/work/get/deduction', async ctx => {
  try {
    const password = getPassword(ctx)
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      if (memberActions.memberDutyLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.getOwn(parseInt(id))
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/deduction/:id/work/new/deduction', async ctx => {
  try {
    const { id } = ctx.params
    const { password, content } = ctx.request.body
    if (loginMember(parseInt(id), password).status == 'ok') {
      if (memberActions.memberDutyLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.createDeduction(content)
        io.emit('deduction', {
          sendTo: [
            'member/' + ctx.request.body.person,
            createIndex({
              ...utils.createPersonNumberAnalyzor(Number(ctx.request.body.person)),
              type: 'class',
            }),
          ],
          content: ctx.request.body.person + '被扣分',
          id: ctx.request.body.id,
          type: 'deduction',
          action: 'create',
        })
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/deduction/:id/work/turnd/deduction', async ctx => {
  try {
    const { id: number } = ctx.params
    const { id, password, person, reason } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberDutyLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.refuseCallback(person, id, reason)
        io.emit('deduction', {
          sendTo: [
            'member/' + ctx.request.body.person,
            createIndex({
              ...utils.createPersonNumberAnalyzor(Number(ctx.request.body.person)),
              type: 'class',
            }),
          ],
          content: ctx.request.body.person + '的一个扣分被驳回',
          id: ctx.request.body.id,
          type: 'deduction',
          action: 'update',
        })
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/deduction/:id/work/del/deduction', async ctx => {
  try {
    const { id: number } = ctx.params
    const { id, password, person } = ctx.request.body
    if (loginMember(parseInt(number), password).status == 'ok') {
      if (memberActions.memberDutyLimitCheckPower(ctx.params.id, 'deduction')) {
        ctx.response.body = deductionActions.deleteDeduction(person, id)
        io.emit('deduction', {
          sendTo: [
            'member/' + ctx.request.body.person,
            createIndex({
              ...utils.createPersonNumberAnalyzor(Number(ctx.request.body.person)),
              type: 'class',
            }),
          ],
          content: ctx.request.body.person + '的一个扣分被删除',
          id: ctx.request.body.id,
          type: 'deduction',
          action: 'delete',
        })
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/export/deduction/class', async ctx => {
  try {
    const { password, start, end, number } = ctx.request.body as {
      password: string
      start: string
      end: string
      number: number
    }
    if (loginMember(number, password).status == 'ok') {
      const data = deductionActions.exportAsClass({
        start,
        end,
      })
      const token = v4()
      csvTokens[token] = data.details
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/export/deduction/detail', async ctx => {
  try {
    const { password, start, end, number } = ctx.request.body as {
      password: string
      start: string
      end: string
      number: number
    }
    if (loginMember(number, password).status == 'ok') {
      const data = deductionActions.exportAsDetails({
        start,
        end,
      })
      const token = v4()
      csvTokens[token] = data.details as string
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// 学习部可用API
router.get('/api/member/admin/:id/get/all/post', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'post')) {
        ctx.response.body = postActions.getAll()
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/:id/del/post', async ctx => {
  try {
    const { password, person } = ctx.request.body
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'post')) {
        ctx.response.body = postActions.deletePost(parseInt(person), ctx.request.body.id)
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/admin/:id/download/post', async ctx => {
  try {
    const { id, password, person } = ctx.request.body
    if (loginMember(parseInt(ctx.params.id), password).status == 'ok') {
      if (memberActions.memberAdminLimitCheckPower(ctx.params.id, 'post')) {
        let index = v4()
        while (docTokens[index] !== undefined) {
          index = v4()
        }
        docTokens[index] = postActions.downloadDocument(id, person) as Buffer
        ctx.response.body = {
          status: 'ok',
          details: {
            token: index,
          },
        }
      } else {
        ctx.response.body = {
          status: 'error',
          reason: 'no-auth',
        }
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

router.get('/api/member/post/:id/work/get/post', async ctx => {
  try {
    const password = getPassword(ctx)
    const { id } = ctx.params
    if (loginMember(parseInt(id), password).status == 'ok') {
      ctx.response.body = postActions.getOwn(parseInt(id))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/post/:id/work/upload/post', async (ctx, next) => {
  await uploader.single('file')(ctx, next)
  if (ctx.file !== undefined) {
    try {
      const { password, person } = ctx.request.body
      if (loginMember(parseInt(person), password).status == 'ok') {
        ctx.response.body = postActions.editLocation(parseInt(ctx.params.id), ctx.file)
      } else {
        ctx.response.status = 402
        ctx.response.body = {
          status: 'error',
          reason: 'password-wrong',
        }
      }
    } catch (e) {
      ctx.response.status = 500
      ctx.response.body = {
        status: 'error',
        reason: 'type-error',
        text: new Error(<string>e).message,
      }
    }
  } else {
    ctx.response.status = 403
    ctx.response.body = {
      status: 'error',
      reason: 'incorrect-type',
    }
  }
})
router.post('/api/member/post/:id/work/download/post', async ctx => {
  try {
    const { id, password, person } = ctx.request.body
    if (loginMember(parseInt(person), password).status == 'ok') {
      let index = v4()
      while (docTokens[index] !== undefined) {
        index = v4()
      }
      docTokens[index] = postActions.downloadDocument(id, person)
      ctx.response.body = {
        status: 'ok',
        details: {
          token: index,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/post/:id/work/new/post', async ctx => {
  try {
    const { id, password, content, person } = ctx.request.body
    if (loginMember(parseInt(person), password).status == 'ok') {
      ctx.response.body = postActions.createPost(parseInt(person), id, content)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/member/post/:id/work/del/post', async ctx => {
  try {
    const { id, password, person } = ctx.request.body
    if (loginMember(parseInt(person), password).status == 'ok') {
      ctx.response.body = postActions.deletePost(parseInt(person), id)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// Admin APIs (For School Leaders.)
router.get('/api/admin/login', async ctx => {
  try {
    const password = getPassword(ctx)
    ctx.response.body = loginAdmin(password)
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/all/deduction', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = deductionActions.getAll()
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/all/post', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = postActions.getAll()
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/all/member', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.multiProcess(memberActions.getAllAsRaw())
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/core/member', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.multiProcess(memberActions.getCoreAsRaw())
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

router.post('/api/admin/download/post', async ctx => {
  try {
    const { id, password, person } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      let index = v4()
      while (docTokens[index] !== undefined) {
        index = v4()
      }
      docTokens[index] = postActions.downloadDocument(id, person)
      ctx.response.body = {
        status: 'ok',
        details: {
          token: index,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

router.post('/api/admin/edit/password', async ctx => {
  try {
    const password = ctx.request.body.password
    const { newp } = ctx.request.body
    if (loginAdmin(String(password)).status == 'ok') {
      ctx.response.body = resetPassword(utils.createDEBase64(newp))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/export/deduction/class', async ctx => {
  try {
    const { password, start, end } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      const data = deductionActions.exportAsClass({
        start,
        end,
      })
      const token = v4()
      csvTokens[token] = data.details
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/export/deduction/detail', async ctx => {
  try {
    const { password, start, end } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      const data = deductionActions.exportAsDetails({
        start,
        end,
      })
      const token = v4()
      csvTokens[token] = data.details as string
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/:department/member', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.multiProcess(memberActions.getDepartmentAsRaw(ctx.params.department))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/del/deduction', async ctx => {
  try {
    const { password } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = deductionActions.deleteDeduction(parseInt(ctx.request.body.person), ctx.request.body.id)
      io.emit('deduction', {
        sendTo: [
          'member/' + ctx.request.body.person,
          createIndex({
            ...utils.createPersonNumberAnalyzor(Number(ctx.request.body.person)),
            type: 'class',
          }),
        ],
        content: ctx.request.body.person + '的一个扣分被删除',
        id: ctx.request.body.id,
        type: 'deduction',
        action: 'delete',
      })
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/del/post', async ctx => {
  try {
    const { password } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = postActions.deletePost(parseInt(ctx.request.body.person), ctx.request.body.id)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/full/member', async ctx => {
  try {
    const { password, member, position } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.editPosition(parseInt(member), position as 'clerk' | 'vice-minister')
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/vio/member', async ctx => {
  try {
    const { password, member } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      memberActions.createNewViolation(parseInt(member), 1)
      ctx.response.body = {
        status: 'ok',
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/new/member', async ctx => {
  try {
    const { password, member } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.createMember(member)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/del/member', async ctx => {
  try {
    const { password, person } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = memberActions.deleteMember(parseInt(person))
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/volunteer/sendout', async ctx => {
  try {
    const { password } = ctx.request.body
    if (loginAdmin(password).status == 'ok') {
      const members = memberActions.getAllAsRaw().details
      members.forEach(item => {
        memberActions.autoCalculateVolunteer(item.number)
      })
      if (members.length === 0) {
        throw '没有成员'
      }
      return {
        status: 'ok',
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/admin/get/all/volunteer', async ctx => {
  try {
    const password = getPassword(ctx)
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = volunteerActions.getVolunteerAsAll()
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/create/volunteer', async ctx => {
  try {
    const { password, volunteer } = ctx.request.body as {
      password: string
      volunteer: VolunteerMulti
    }
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = volunteerActions.createVolunteerMulti(volunteer as VolunteerMulti)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/delete/volunteer', async ctx => {
  try {
    const { password, volunteerInfo } = ctx.request.body as {
      password: string
      volunteerInfo: {
        person: number[]
        id: string
      }
    }
    const { id, person } = volunteerInfo
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = volunteerActions.deleteVolunteerMulti(id, person)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/edit/volunteer', async ctx => {
  try {
    const { password, volunteerInfo } = ctx.request.body as {
      password: string
      volunteerInfo: {
        person: number[]
        id: string
        status: volunteer['status']
      }
    }
    const { id, person } = volunteerInfo
    if (loginAdmin(password).status == 'ok') {
      ctx.response.body = volunteerActions.editVolunteerStatusMulti(person, id)
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.post('/api/admin/export/volunteer', async ctx => {
  try {
    const { password, config } = ctx.request.body as {
      password: string
      config?: {
        start: string
        end: string
      }
    }
    if (loginAdmin(password).status == 'ok') {
      const token = v4()
      csvTokens[token] = volunteerActions.exportData.exportAsAll(config)
      ctx.response.body = {
        status: 'ok',
        details: {
          token,
        },
      }
    } else {
      ctx.response.body = {
        status: 'error',
        reason: 'password-wrong',
      }
    }
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})

// All APIs
router.post('/api/feed/back', async ctx => {
  // Here, it is no use to check the password
  try {
    ctx.response.body = utils.createFeedback(ctx.request.body)
  } catch (e) {
    ctx.response.body = {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
})
router.get('/api/department/', async ctx => {
  ctx.response.body = getDepartmentData() as status
})
router.get('/api/department/list', async ctx => {
  const data = getDepartmentData()
  ctx.response.body = {
    status: 'ok',
    details: utils.createObjectToArrayTransformer('value', data.details.departments),
  }
})
router.get('/api/department/:department/duty', async ctx => {
  ctx.response.body = {
    status: 'ok',
    details: allowPowers(ctx.params.department),
  }
})
router.get('/api/power/list', async ctx => {
  ctx.response.body = {
    status: 'ok',
    details: utils.createObjectToArrayTransformer('value', getPublicPower().details.power),
  }
})
router.get('/api/power', async ctx => {
  ctx.response.body = getPublicPower()
})
router.get('/config', async ctx => {
  ctx.response.body = readData()
})

setInterval(() => {
  const members = memberActions.getAllAsRaw().details
  members.forEach(item => {
    memberActions.autoCalculateScore(item.number)
  })
  const emailConfigs = getEmailConfig()
  postActions.createAutoEmailPostDetector(emailConfigs.username, emailConfigs.password, emailConfigs.hosts).then(() => {
    // Complete for detectment.
  })
}, 3600) // 每3小时计算一次素质分

// Use routes to register APIs.
server.use(router.routes())
server.use(router.allowedMethods())

// Use routes to register APIs.
downloaderServer.use(downloadRouter.routes())
downloaderServer.use(downloadRouter.allowedMethods())

// Redirect 404 pages(route)
server.use(async ctx => {
  if (ctx.status == 404) {
    if (process.env.NODE_ENV == 'production') {
      ctx.response.body = readFileSync(resolve(__dirname, './pages/index.html')).toString()
    } else {
      ctx.response.type = 'html'
      ctx.response.body = 'Sorry, we do not have index page in <b>Development</b> server.'
    }
  }
})

// Socket.io Chat Product
// eslint-disable-next-line @typescript-eslint/no-unused-vars
io.on('connection', socket => {
  // ...
  let query
  if (socket.handshake.query.type == 'class') {
    query = `class/${Number(socket.handshake.query.gradeid)} / ${Number(socket.handshake.query.classid)}`
  } else {
    query = 'admin'
  }
  // console.log(query)
  socket.to(query).emit('quit-app')
  socket.join(query)
  socket.emit('connect-successfully')
})

app.setLoginItemSettings({
  openAtLogin: process.env.NODE_ENV == 'production',
})

app.whenReady().then(() => {
  tray = new Tray(process.env.NODE_ENV === 'development' ? resolve(__dirname, '../../../icons/server.ico') : resolve(__dirname, '../icons/server.ico'))
  const generateTwoThirds = (val: number) => Math.floor((val * 2) / 3)
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width: generateTwoThirds(width),
    height: generateTwoThirds(height),
    frame: false,
    webPreferences: {
      preload: resolve(__dirname, process.env.NODE_ENV == 'development' ? './preload.js' : './server.preload.min.js'),
    },
    show: false,
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
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
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000/server')
  } else {
    const originer = new URL(getOrigin())
    originer.href = '/server'
    mainWindow.loadURL(originer.toString())
  }
  // mainWindow.loadURL(process.env.NODE_ENV === 'development' ? 'http://localhost:3000/server' : originer.toString())
  ipcMain.on('close-main-window', () => mainWindow.hide())
  ipcMain.on('minimize-main-window', () => mainWindow.minimize())
  ipcMain.on('maximize-main-window', () => (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()))
  mainWindow.on('close', event => {
    mainWindow.hide()
    event.preventDefault()
  })
})

// Listen the Server(Let it run.)
httpServer.listen(80)
httpsServer.listen(443)
downloaderSecureServer.listen(8080)
downloaderUnSecureServer.listen(8081)

// try {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   require('electron-reloader')(module)
//   // eslint-disable-next-line no-empty
// } catch (_e) {}
