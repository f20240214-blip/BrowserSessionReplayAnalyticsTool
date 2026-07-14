declare module 'http' {
  import type { Socket } from 'node:net'

  export interface IncomingMessage {
    socket: Socket & { remoteAddress?: string }
  }
}

declare module 'ws' {
  import type { EventEmitter } from 'node:events'
  import type { IncomingMessage } from 'http'

  export type Data = string | Buffer | ArrayBuffer | Buffer[]

  export class WebSocket extends EventEmitter {
    on(event: 'message', listener: (data: Data) => void): this
    on(event: 'close', listener: () => void): this
    on(event: 'error', listener: (err: Error) => void): this
    send(data: string | Buffer): void
    close(code?: number, reason?: string): void
    terminate(): void
  }

  export interface WebSocketServerOptions {
    port: number
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options: WebSocketServerOptions)
    on(event: 'connection', listener: (socket: WebSocket, request: IncomingMessage) => void): this
    on(event: 'error', listener: (err: Error) => void): this
    close(callback?: (err?: Error | null) => void): void
  }
}
