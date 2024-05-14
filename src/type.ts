export type MockOptions = {
  /**
   * Mock folder path
   */
  mockPath?: string
  /**
   * Mock enabled
   */
  enabled?: boolean
}

export interface MockEvent {
  /**
   * Event name
   */
  name: string
  /**
   * response
   */
  response?: (opts: any) => any | any
  /**
   * Event interval; if not set, execute immediately once.
   */
  interval?: number
  /**
   * Jitter value (0-100)
   * You can understand this as the probability of triggering the event push.
   */
  jitter?: number
}

export interface MockMethod {
  /**
   * Request path
   */
  url: string
  /**
   * Timeout duration
   */
  timeout?: number
  /**
   * Events
   */
  events: MockEvent[]
}