import { createSdbdataParser, createSdbdataSaver } from 'packages/server/src/modules/utils'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import { resolve } from 'path'

const createAdminRecorder = (id: string) => {
  const adminConnector = resolve(tmpdir(), '..', 'magnifique', 'admin', 'secret', 'messages.sdbdata')
  if (!existsSync(adminConnector)) {
    createSdbdataSaver(adminConnector, {
      messageRooms: [] as string[],
    })
  }
  let inf = createSdbdataParser(adminConnector) as {
    messageRooms: string[]
  }
  inf.messageRooms.push(id)
  createSdbdataSaver(adminConnector, inf)
}

export { createAdminRecorder }
