import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import baseurl from '../../../modules/baseurl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (
  newpwd: { oldpwd: string; newpwd1: string; newpwd2: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any
) => {
  if (newpwd.newpwd1 === newpwd.newpwd2) {
    axios({
      url: `${baseurl}admin/edit/password`,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      data: JSON.stringify({
        newp: window.btoa(newpwd.newpwd1),
        password: window.btoa(newpwd.oldpwd),
      }),
    }).then(response => {
      if (response.data.status == 'ok') {
        ElMessageBox.alert('成功', '修改密码', {
          type: 'success',
          center: true,
        }).then(() => {
          localStorage.removeItem('adminLoginInfo')
          router.push('/')
        })
      } else {
        ElMessageBox.alert(
          t('dialogs.' + response.data.reason, {
            msg: response.data.text,
          }),
          '错误',
          {
            type: 'error',
            center: true,
          }
        )
      }
    })
  } else {
    ElMessageBox.alert('密码输入不一致', '错误', {
      type: 'error',
      center: true,
    })
  }
}
