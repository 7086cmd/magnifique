declare interface department {
  departments: Record<
    string,
    {
      name: string
      duty: Array<'deduction' | 'post' | 'volunteer'>
      classes?: {
        reason: string
        deduction: number
      }[]
    }
  >
}
