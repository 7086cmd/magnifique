/* eslint-disable @typescript-eslint/no-explicit-any */
declare type status =
  | {
      status: 'ok'
    }
  | {
      status: 'ok'
      details: any[]
    }
  | {
      status: 'error'
      reason: 'not-exist' | 'password-wrong' | 'no-auth' | 'not-exists'
    }
  | {
      status: 'error'
      reason: 'type-error'
      text: string
    }
