import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import baseurl from '../../../modules/baseurl'

export default (
  gradeid: number,
  classid: number,
  newpwd: {
    oldpwd: string
    newpwd1: string
    newpwd2: string
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any
) => {
  if (newpwd.newpwd1 === newpwd.newpwd2) {
    axios({
      url: `${baseurl}class/edit/password`,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      params: JSON.stringify({
        gradeid,
        classid,
        newp: window.btoa(newpwd.newpwd1),
        password: window.btoa(newpwd.oldpwd),
      }),
      data: JSON.stringify({
        gradeid,
        classid,
        newp: window.btoa(newpwd.newpwd1),
        password: window.btoa(newpwd.oldpwd),
      }),
    }).then((response) => {
      if (response.data.status == 'ok') {
        ElMessageBox.alert('成功', '修改密码', {
          type: 'success',
          center: true,
        }).then(() => {
          localStorage.removeItem('classLoginInfo')
          router.push('/class/login')
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
