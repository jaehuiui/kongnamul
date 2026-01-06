import { mount, createState } from '@kongnamul/core'

const like = createState(0)

function schema() {
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

const container = document.getElementById('app')
mount(schema, container)
