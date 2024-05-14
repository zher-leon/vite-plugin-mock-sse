import path from "path"
import pc from 'picocolors'

/**
 * source @see https://github.com/vbenjs/vite-plugin-mock/blob/main/packages/vite-plugin-mock/src/utils.ts
 * @param path path
 */
export function isAbsPath(path: string | undefined) {
  if (!path) {
    return false
  }
  // Windows path format: Starts with C:\ or \\, or includes a drive letter (e.g., D:\path\to\file).
  if (/^([a-zA-Z]:\\|\\\\|(?:\/|\uFF0F){2,})/.test(path)) {
    return true
  }
  // Unix/Linux path format: Starts with /
  return /^\/[^/]/.test(path)
}

export function getAbsPath(url: string = '') {
  const cwd = process.cwd()
  return isAbsPath(url) ? url : path.join(cwd, url)
}

export function getRandomNumber(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

type PrintType = 'info' | 'warning' | 'error'
export function print(type: PrintType, message: string | object) {
  type = type || 'info'

  const color: Record<PrintType, any> = {
    info: pc.green,
    warning: pc.yellow,
    error: pc.red
  }

  console.log(
    `${pc.dim(new Date().toLocaleTimeString())} ${pc.cyan('[vite:mock-sse]')}: ${color[type]?.(type)} ${pc.dim(typeof message === 'string' ? message : '')}`
  )

  typeof message === 'object' && console.log(message)
}