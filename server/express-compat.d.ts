declare module 'express' {
  export interface Request {
    originalUrl: string
    method: string
    params: Record<string, string | undefined>
  }

  export interface Response {
    statusCode: number
    status(code: number): this
    json(body: unknown): this
    on(event: 'finish', listener: () => void): this
  }

  export type NextFunction = (error?: unknown) => void

  export interface Application {
    use(...args: unknown[]): this
    get(path: string, handler: (req: Request, res: Response) => unknown): this
  }

  export interface RouterInterface {
    get(path: string, handler: (req: Request, res: Response) => unknown): this
    use(...args: unknown[]): this
  }

  export function Router(): RouterInterface

  export function json(): unknown
  export function urlencoded(options: { extended: boolean }): unknown

  interface ExpressFactory {
    (): Application
    json: typeof json
    urlencoded: typeof urlencoded
  }

  const express: ExpressFactory
  export default express
}

declare module 'cors' {
  export default function cors(options?: unknown): unknown
}
