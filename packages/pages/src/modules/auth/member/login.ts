import { ElMessageBox } from 'element-plus'
import axios from 'axios'
import baseurl from '../../baseurl'
import type { Router } from 'vue-router'
const login = async (number: number, passwordEncoded: string, router: Router) => {
  const reqUrl = baseurl + `member/${number}/login?password=${passwordEncoded}`
  await axios(reqUrl, {
    data: {
      password: passwordEncoded,
    },
  }).then(response => {
    if (response.data.details == 'ok') {
      ElMessageBox.alert('成功登录', '成功', {
        center: true,
        type: 'success',
      }).then(() => {
        router.push('/member/')
      })
      setTimeout(() => router.push('/member/'), 3000)
    }
  })
}
export default login
