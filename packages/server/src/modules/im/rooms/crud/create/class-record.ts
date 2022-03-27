import { createSdbdataParser, createSdbdataSaver } from 'packages/server/src/modules/utils'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import { createYearTransformer } from 'packages/client/src/modules/utils'
import { resolve } from 'path'

const createClassRecorder = (gradeid: number, classid: number, id: string) => {
  const classConnector = resolve(tmpdir(), '..', 'magnifique', String(createYearTransformer(gradeid)), String(classid), 'messages.sdbdata')
  if (!existsSync(classConnector)) {
    createSdbdataSaver(classConnector, {
      messageRooms: [] as string[],
    })
  }
  let inf = createSdbdataParser(classConnector) as {
    messageRooms: string[]
  }
  inf.messageRooms.push(id)
  createSdbdataSaver(classConnector, inf)
}

export { createClassRecorder }
