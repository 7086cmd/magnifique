import { tmpdir } from 'os'
import { resolve } from 'path'

export default (id: string) => {
  return resolve(tmpdir(), '..', 'magnifique', 'im_rooms', `${id}.sdbdata`)
}
