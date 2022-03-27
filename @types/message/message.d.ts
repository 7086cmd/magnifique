declare interface message {
  creator: string
  createDate: string
  type: 'text' | 'image' | 'file'
  content: string
  status: Record<string, boolean>
}

declare interface MessageItem {
  id: string
  creator: string
  createDate: string
  type: 'text' | 'image' | 'file'
  content: string
  status: Record<string, boolean>
}
