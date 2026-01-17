import { createState, mount, debug, type Schema } from '@kongnamul/core'

debug()

const like = createState<number>(0)

function schema(): Schema {
  return {
    type: 'div',
    props: {
      id: 'container',
    },
    children: [
      {
        type: 'h1',
        props: {
          id: 'title',
        },
        children: [`People who like kongnamul: ${like.get()}`],
      },
      {
        type: 'button',
        props: {
          onClick: () => {
            like.set(like.get() + 1)
          },
        },
        children: ['Click me'],
      },
    ],
  }
}

const container = document.getElementById('app')!
if (!container) {
  throw new Error('Container element not found')
}

mount(schema, container)
