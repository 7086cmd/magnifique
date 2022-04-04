import { createSdbdataParser } from 'packages/server/src/modules/utils'
import { readdirSync } from 'fs'
import { tmpdir } from 'os'
import { resolve } from 'path'

const bpth = resolve(tmpdir(), '..', 'magnifique', 'im_rooms')

const getAllRooms = (user: string) => {
  const pths = readdirSync(bpth).map(item => resolve(bpth, item))
  const items = pths.map(item => (createSdbdataParser(item) as MessageFile).config)
  return items.filter(item => item.users.includes(user)).map(x => x.id)
}

const getAllRoomsDetail = () => {
  const pths = readdirSync(bpth).map(item => resolve(bpth, item))
  const items = pths.map(item => (createSdbdataParser(item) as MessageFile).config)
  return items
}

export { getAllRooms, getAllRoomsDetail }
