declare interface latestFile {
  version: string
  files: {
    url: string
    sha512: string
    size: number
  }[]
  path: string
  sha512: string
  releaseDate: Date
}
