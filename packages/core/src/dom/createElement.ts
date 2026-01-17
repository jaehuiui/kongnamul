import type { Schema, Props, DOMNode } from '../types'

export function createElement(schema: Schema): DOMNode {
  // Leaf Node: 문자열이면 텍스트 노드 생성
  if (typeof schema === 'string') {
    return document.createTextNode(schema)
  }

  // Parent Node: Element 생성
  const el = document.createElement(schema.type)

  // Element: 속성 매핑
  if (schema.props) {
    applyProps(el, schema.props)
  }

  // Element: 재귀적으로 children 생성
  if (schema.children) {
    for (const child of schema.children) {
      el.appendChild(createElement(child))
    }
  }

  return el
}

function applyProps(el: HTMLElement, props: Props): void {
  Object.entries(props).forEach(([key, value]) => {
    // Props: Event Handler 등록
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase()

      if (!validateEvent(eventName)) {
        throw new Error(`Invalid event name: ${eventName}`)
      }

      el.addEventListener(eventName, value)
    }
    // Props: 나머지 Props 등록
    else if (typeof value === 'string') {
      el.setAttribute(key, value)
    }
  })
}

const VALID_EVENT_NAMES = ['click', 'change', 'submit', 'input', 'keydown', 'keyup', 'keypress']

function validateEvent(eventName: string): boolean {
  if (!VALID_EVENT_NAMES.includes(eventName)) {
    return false
  }
  return true
}
