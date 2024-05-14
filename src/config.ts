import { MockMethod, MockOptions } from "./type"
import { getAbsPath, print } from "./tools"
import path from 'path'
import fg from 'fast-glob'
import { GetOutputFile, JS_EXT_RE, bundleRequire } from "bundle-require"
import { isFunction } from "lodash-es"
import { ResolvedConfig } from "vite"

export async function initMockMethods(options: MockOptions, config: ResolvedConfig): Promise<MockMethod[]> {
  const { mockPath } = options
  const methods = []
  const url = getAbsPath(mockPath)
  const mockFiles = fg.globSync(['**/*.{ts,mjs,js}'], { cwd: url })

  try {
    for (const file of mockFiles) {
      const module = await loadModule(path.join(url, file), config)

      if (Array.isArray(module)) {
        methods.push(...module)
      } else {
        methods.push(module)
      }
    }
  } catch (error) {
    print('error', error)
  }

  return methods
}

const getOutputFile: GetOutputFile = (filepath, format) => {
  const dirname = path.dirname(filepath)
  const basename = path.basename(filepath)
  const randomname = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  return path.resolve(
    dirname,
    `_${basename.replace(JS_EXT_RE, `.bundled_${randomname}.${format === 'esm' ? 'mjs' : 'cjs'}`)}`,
  )
}

async function loadModule(path: string, config: ResolvedConfig) {
  console.log('path', path)
  const bundle = await bundleRequire({
    filepath: path,
    getOutputFile,
    format: 'esm'
  })

  let module = bundle.mod.default || bundle.mod
  if  (isFunction(module)) {
    module = await module({ env: config.env, mode: config.mode, command: config.command })
  }
  return module
}