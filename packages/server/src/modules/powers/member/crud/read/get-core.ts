import getAll from './get-all'

export default () => ({
  status: 'ok',
  details: getAll().details.filter(item => item.union.leader),
})
