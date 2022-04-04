declare interface SubscribeContent {
  type: 'message' | 'deduction'
  method: 'patch' | 'delete' | 'post'
  id: string
  title: string
  actioner: string
  receiver: string
  actioner_name: string
  receiver_name: string
}

export { SubscribeContent }
