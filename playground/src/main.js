import { render } from '@kongnamul/core'

const schema = {
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
      children: ['Do you know kongnamul?'],
    },
    {
      type: 'p',
      props: {
        id: 'description',
      },
      children: ['I like it'],
    },
  ],
}

const container = document.getElementById('app')
render(schema, container)
