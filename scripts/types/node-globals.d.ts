// Declarações para variáveis globais do Node.js
declare const require: {
  main: any
  (id: string): any
  cache: Record<string, any>
}

declare const process: {
  exit: (code?: number) => never
  cwd(): string
  env: Record<string, string | undefined>
  platform: string
  argv: string[]
  stdin: any
  stdout: any
  stderr: any
}

declare const module: {
  exports: any
}

declare const __dirname: string
declare const __filename: string

// Declarações para módulos Node.js
declare module 'fs' {
  export function existsSync(path: string): boolean
  export function readFileSync(path: string, encoding?: string): string
  export function readdirSync(path: string): string[]
  export function statSync(path: string): any
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void
  export function writeFileSync(path: string, data: string, encoding?: string): void
  export function appendFileSync(path: string, data: string, encoding?: string): void
  export function unlinkSync(path: string): void
}

declare module 'fs/promises' {
  export function readFile(path: string, encoding?: string): Promise<string>
  export function readdir(path: string): Promise<string[]>
  export function stat(path: string): Promise<any>
}

declare module 'path' {
  export function join(...paths: string[]): string
  export function extname(path: string): string
  export function basename(path: string, ext?: string): string
  export function dirname(path: string): string
  export function resolve(...paths: string[]): string
  export function relative(from: string, to: string): string
}

declare module 'child_process' {
  export function execSync(command: string, options?: any): Buffer | string
  export function exec(command: string, callback?: (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => void): any
}

declare module 'util' {
  export function promisify(fn: Function): Function
}
