declare namespace PostFetch {
  export interface fetchAsClass {
    gradeid: number
    classid: number
    password: string
    type: 'class'
  }

  export interface fetchAsSingleMember {
    number: number
    password: string
    type: 'member'
    name: string
  }

  export interface fetchAsMemberAdmin {
    number: number
    password: string
    type: 'member_admin'
  }

  export interface fetchAsAdmin {
    password: string
    type: 'admin'
  }

  export type fetcherOptions = fetchAsAdmin | fetchAsClass | fetchAsMemberAdmin | fetchAsSingleMember

  export interface postFetcherConfig {
    type: fetcherOptions['type']
    getter: string
    deleter: false | string
    creater: false | string
    uploader: false | string
    downloader: false | string
    standardConfig: fetcherOptions
    name?: string
  }
}

export { PostFetch }
