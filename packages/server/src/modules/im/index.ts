import { getOptions as createMemberMap } from 'packages/server/src/modules/im/rooms/utils/fetch-all-user'
import * as roomActions from './rooms'
import * as messageActions from './messages'
import { loginModule } from './auth'
export * from './rooms'
export * from './messages'
export * from './auth'
export { createMemberMap }
export default {
  roomActions,
  messageActions,
  loginModule,
  createMemberMap,
}
