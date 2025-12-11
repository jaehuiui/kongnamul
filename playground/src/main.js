import { render } from '@cilantro/core'

const snapshot = {
  type: 'h1',
  content: '저는 고수가 싫어요',
}

const container = document.getElementById('app')
render(snapshot, container)
