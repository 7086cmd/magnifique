import { ElMessageBox } from 'element-plus'
import axios from 'axios'
import baseurl from '../../baseurl'
import failfuc from '../../failfuc'
const login = async (passwordEncoded: string) => {
  const reqUrl = baseurl + `admin/login?password=${passwordEncoded}`
  await axios(reqUrl, {
    data: {
      password: passwordEncoded,
    },
  })
    .then(response => {
      if (response.data.status == 'ok') {
        return window.btoa(
          JSON.stringify({
            password: window.btoa(passwordEncoded),
          })
        )
      } else {
        window.localStorage.removeItem('adminLoginInfo')
        failfuc(response.data.reason, response.data.text)
        throw 'error'
      }
    })
    .catch(reason => {
      window.localStorage.removeItem('adminLoginInfo')
      if (new Error(reason).message !== 'error') {
        ElMessageBox.alert('前端执行报错：' + new Error(reason).message, '登陆失败')
      }
      throw 'error'
    })

  return window.btoa(
    JSON.stringify({
      password: passwordEncoded,
    })
  )
}
export default login
