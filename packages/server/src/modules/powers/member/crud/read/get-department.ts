import getAll from './get-all'
export default (department: string) => ({
  status: 'ok',
  details: getAll().details.filter(item => item.union.department === department),
})
