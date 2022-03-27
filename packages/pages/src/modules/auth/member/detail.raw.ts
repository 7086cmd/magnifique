import axios from 'axios'
import baseurl from '../../baseurl'
export default (number: number) => {
  axios(`${baseurl}member/getinfo/${number}/raw`).then(response => {
    return response.data.details as member
  })
}
