declare interface MagnifiqueMessageCreatePostData {
  type: 'markdown' | 'image' | 'file'
  content: string
  id: string
  creator: string
  password: string
}
