import axios from 'axios'
import qs from 'qs'

export default (link: string, method: 'post' | 'get', data: object) => {
  if (method == 'get') {
    const params = qs.stringify(data)
    axios({
      url: link + '?' + params,
      method,
    }).then(response => {
      if (response.data.status == 'error') {
        if (response.data.reason === 'type-error') {
          throw response.data.text
        } else {
          throw response.data.reason
        }
      } else {
        return response.data.details
      }
    })
  }
}
