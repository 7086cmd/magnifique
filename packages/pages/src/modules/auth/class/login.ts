import { ElMessageBox } from 'element-plus'
import axios from 'axios'
import baseurl from '../../baseurl'
import failfuc from '../../failfuc'
const login = async (gradeid: number, classid: number, passwordEncoded: string) => {
  const reqUrl = baseurl + `class/${gradeid}/${classid}/login?password=${passwordEncoded}`
  await axios(reqUrl, {
    data: {
      password: passwordEncoded,
    },
  })
    .then(response => {
      if (response.data.status == 'ok') {
        return window.btoa(
          JSON.stringify({
            gradeid: gradeid,
            classid: Number(classid),
            password: window.btoa(passwordEncoded),
          })
        )
      } else {
        window.localStorage.removeItem('classLoginInfo')
        failfuc(response.data.reason, response.data.text)
        throw 'error'
      }
    })
    .catch(reason => {
      window.localStorage.removeItem('classLoginInfo')
      ElMessageBox.alert('前端执行报错：' + new Error(reason).message, '登陆失败')
      throw 'error'
    })

  return window.btoa(
    JSON.stringify({
      gradeid: gradeid,
      classid: Number(classid),
      password: passwordEncoded,
    })
  )
}
export default login
