import type { Plugin } from 'vite'
import { ResolvedConfig } from 'vite'
import url from 'url'
import { MockMethod, MockOptions } from './type'
import { NextHandleFunction } from 'connect'
import { initMockMethods } from './config'
import { print } from './tools'
import { pathToRegexp } from 'path-to-regexp'
import { EventSourceHandler } from './event-handler'

let mockEventSource: MockMethod[] = []
const handler = new Map<string, EventSourceHandler>()

const optionsConstant: MockOptions = {
  mockPath: 'mock',
  enabled: true
}

const makeMockServer = async function (options: MockOptions, config: ResolvedConfig) {
  mockEventSource = await initMockMethods(options, config)
}

const handleMiddlewares = function (options: MockOptions): NextHandleFunction {
  return (req, res, next) => {
    let urlQuery: url.UrlWithParsedQuery = null
    if (req.url) {
      urlQuery = url.parse(req.url, true)
    }

    const pathname = urlQuery?.pathname
    const matchSource = mockEventSource.find(source => {
      if (!pathname || !source.url) {
        return false
      }

      return pathToRegexp(source.url).test(pathname)
    })

    if (matchSource) {
      const event = new EventSourceHandler({ req, res }, matchSource)
      handler.set(matchSource.url, event)
      print('info', `sse invoke ${matchSource.url}`)
      return
    }
    next()
  }
}

export function useVitePluginSSEMock(options: MockOptions = {}): Plugin {
  let config: ResolvedConfig
  let needMock = false

  options = {
    ...optionsConstant,
    ...options
  }

  return {
    name: 'vite-plugin-sse-mock',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig
      needMock = config.command === 'serve' && options.enabled!

      if (needMock) {
        makeMockServer(options, resolvedConfig)
      }
    },
    configureServer({ middlewares }) {
      if (!needMock) {
        return;
      }

      const middleware = handleMiddlewares(options)
      middlewares.use(middleware)
    }
  }
}

export * from './type';