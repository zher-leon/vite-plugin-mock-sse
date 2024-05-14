
import { IncomingMessage, ServerResponse } from "http";
import { MockEvent, MockMethod } from "./type";
import { isFunction } from "lodash-es";
import Mock from 'mockjs'
import { getRandomNumber, print } from "./tools";

export type ServerHandler = {
  req: IncomingMessage,
  res: ServerResponse
}

export class EventSourceHandler {
  url: string = null
  timeout: number = 10000
  events: MockEvent[] = []
  timers = new Map()
  server: ServerHandler = null

  constructor(server: ServerHandler, config: MockMethod) {
    const { url, timeout, events } = config
    this.url = url
    this.timeout = timeout
    this.events = events
    
    this.initServer(server)
    this.initEvents(events)
  }

  initServer(server: ServerHandler) {
    server.res.setHeader('Content-Type', 'text/event-stream')
    server.res.setHeader('Cache-Control', 'no-cache')
    server.res.setHeader('Connection', 'keep-alive')

    server.res.on("close", this.clearTimers.bind(this))
    server.req.on("error", this.clearTimers.bind(this))

    this.server = server
  }

  initEvents(events: MockEvent[]) {
    for (const event of events) {
      const { name, response, interval, jitter = 100 } = event

      const hasTimer = this.timers.get(name)
      if (hasTimer) {
        clearInterval(hasTimer)
      }

      const send = () => {
        const responseMessage = isFunction(response) ? response(this.server) : response
        this.server.res.write(this.sendMessage(name, Mock.mock(responseMessage)))
      }

      if (!interval) {
        send()
        continue;
      }

      const timer = setInterval(() => {
        const random = getRandomNumber(0, 100)
        if (random <= jitter) {
          send()
        }
      }, interval)
      this.timers.set(name, timer)
    }
  }

  sendMessage(event: string, message: any) {
    return `event: ${event}\ndata: ${JSON.stringify(message)}\n\n`
  }

  clearTimers() {
    if (!this.timers) {
      return;
    }
    this.timers.forEach((value, key) => {
      clearInterval(value)
      this.timers.delete(key)
      print('warning', `EventSource: ${this.url}/${key} tasks are being cleaned up.`)
    })
  }

}