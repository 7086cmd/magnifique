import createIndex from 'packages/server/src/modules/im/utils/create-index'

console.log(
  createIndex({
    type: 'class',
    gradeid: 2020,
    classid: 11,
  })
)

import { connect } from 'packages/sw/src/modules/client/connect'

connect({
  type: 'class',
  gradeid: 2,
  classid: 11,
  password: 'MjAyMDEx',
})
