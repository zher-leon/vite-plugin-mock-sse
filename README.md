# vite-plugin-mock-sse

​	Vite's SSE data simulation plugin, developed based on vite.js.

​	The inspiration for this plugin comes from: [vite-plugin-mock](https://github.com/vbenjs/vite-plugin-mock/tree/main)

## Install 

```
npm install i mockjs -D
npm install vite-plugin-mock-sse -D
```

## Usage

- vite.config.ts

```typescript
import { useVitePluginSSEMock } from 'vite-plugin-mock-sse'
import vue from '@vitejs/plugin-vue'

export default () => {
  return {
    plugins: [
      vue(),
      useVitePluginSSEMock({
        mockPath: './src/mock-sse',
        enable: true
      })
    ],
  }
}
```

- useVitePluginSSEMock

```typescript
{
  // Mock folder path
  mockPath?: string
  // Mock enabled
  enabled?: boolean
}
```

## Mock file example

```typescript
import { type MockMethod } from 'vite-plugin-mock-sse'

const sse: MockMethod = {
  url: '/sse',
  timeout: 10000,
  events: [
    {
      name: 'heart_beat',
      interval: 1000,
      response() {
        return new Date().getTime()
      }
    }
  ]
}

export default sse
```

### Event Options

#### name

type: `string`

Type of the event pushed

#### interval

Type: `number`

Event handling interval; if not set, execute immediately once.

#### jitter

type: number

Jitter value, allowable range is 0-100. You can understand it as the probability of event push.

#### response

type: `(opts: ServerHandler) => any | any`

Event response value
