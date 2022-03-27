import { tmpdir } from 'os'
import { resolve } from 'path'
import { createSdbdataParser } from '../utils'

export default () => createSdbdataParser(resolve(tmpdir(), '..', 'magnifique', 'origin.sdbdata')).origin as string
