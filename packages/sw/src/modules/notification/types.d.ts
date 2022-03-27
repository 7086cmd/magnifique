export namespace ServiceWorkerNotification {
  export type options = fetchAsClass | fetchAsAdmin | fetchAsSingleMember
  export interface Types {
    type: 'deduction' | 'message'
    action: 'create' | 'update' | 'delete'
    id: string
  }
  export interface InstallParams {
    user: options
    password: options['password']
    listen: 'deduction' | 'message'
  }
  export interface IOContent {
    sendTo: Array<string>
    content: string
    id: string
    type: 'deduction' | 'message'
    action: 'create' | 'update' | 'delete'
  }
  export interface ShowParams {
    user: string
    content: string
    id: string
    type: 'deduction' | 'message'
    action: 'create' | 'update' | 'delete'
  }
}

/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & typeof globalThis
