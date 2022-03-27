declare interface fetchAsClass {
  gradeid: number
  classid: number
  password: string
  type: 'class'
}

declare interface fetchAsSingleMember {
  number: number
  password: string
  type: 'member'
  name: string
}

declare interface fetchAsMemberAdmin {
  number: number
  password: string
  type: 'member_admin'
}

declare interface fetchAsAdmin {
  password: string
  type: 'admin'
}

declare type fetcherOptions = fetchAsAdmin | fetchAsClass | fetchAsMemberAdmin | fetchAsSingleMember
