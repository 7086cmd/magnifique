import getAll from './get-all'

export default (memberNumber: number) => {
  return {
    status: 'ok',
    details: getAll().details.filter(item => item.deductor.number === memberNumber),
  }
}
