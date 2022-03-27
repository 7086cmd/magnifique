import { getSingleMemberAsRaw, singleProcess } from '../../../member'
import count from '../../count/count'
import { createClassName } from './create-class-name'

export default (
  personNumber: number,
  config?: {
    start: string
    end: string
  }
) => {
  const personData = getSingleMemberAsRaw(personNumber).details
  const data = [createClassName(personNumber), personData.name, personNumber, singleProcess(personData).in, count(personNumber, config)]
  return (
    JSON.stringify(data)
      .split('[')
      .filter(x => x !== '')
      .join('[')
      .split(']')
      .filter(x => x !== '')
      .join(']') + '\n'
  )
}
