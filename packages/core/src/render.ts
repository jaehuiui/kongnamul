import { markUpdatedNode } from './debug'
import type { Schema, ElementSchema, Props, DOMNode } from './types'

let container: HTMLElement | null = null
let createSchema: (() => Schema) | null = null

let prevSchema: Schema | null = null
let rootNode: DOMNode | null = null

function createState<T>(initialState: T) {
  let state = initialState

  return {
    get: () => state,
    set: (nextState: T) => {
      state = nextState
      updateDOM()
    },
  }
}

function mount(_createSchema: () => Schema, _container: HTMLElement) {
  createSchema = _createSchema
  container = _container

  updateDOM()
}

function updateDOM() {
  if (!createSchema || !container) return

  const schema = createSchema()
  render(schema, container)
}

function render(schema: Schema, container: HTMLElement): void {
  // 최초 mount 동작
  if (!prevSchema) {
    rootNode = createElement(schema)
    container.appendChild(rootNode)
  }
  // 이후 리렌더링 동작
  else if (rootNode) {
    rootNode = diff(prevSchema, schema, rootNode)
  }

  // 이전 schema 업데이트
  prevSchema = schema
}

function createElement(schema: Schema): DOMNode {
  // Leaf Node: 문자열이면 텍스트 노드 생성
  if (typeof schema === 'string') {
    return document.createTextNode(schema)
  }

  // Parent Node: Element 생성
  const el = document.createElement(schema.type)

  // Element: 속성 매핑
  if (schema.props) {
    Object.entries(schema.props).forEach(([key, value]) => {
      // Props: Event Handler 등록
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        // TODO: Event Validation 추가
        el.addEventListener(eventName, value)
      }
      // Props: 나머지 Props 등록
      else if (typeof value === 'string') {
        el.setAttribute(key, value)
      }
    })
  }

  // Element: 재귀적으로 children 생성
  if (schema.children) {
    for (const child of schema.children) {
      el.appendChild(createElement(child))
    }
  }

  return el
}

function diff(
  prevSchema: Schema | undefined,
  nextSchema: Schema | undefined,
  dom: DOMNode | ChildNode,
): DOMNode | null {
  // case 1: next schema가 없으면 제거
  if (nextSchema === undefined) {
    dom.remove()
    return null
  }

  // case 2: prev schema가 없으면 신규 생성
  if (prevSchema === undefined) {
    const newDom = createElement(nextSchema)
    dom.parentNode?.appendChild(newDom)
    return newDom
  }

  // case 3: node type이 다르면 교체
  if (
    typeof prevSchema !== typeof nextSchema ||
    (typeof nextSchema !== 'string' && typeof prevSchema !== 'string' && prevSchema.type !== nextSchema.type)
  ) {
    const newDom = createElement(nextSchema)
    dom.replaceWith(newDom)
    markUpdatedNode(newDom, 'replace')
    return newDom
  }

  // case 4: leaf node (텍스트 노드)
  if (typeof nextSchema === 'string') {
    if (prevSchema !== nextSchema) {
      dom.textContent = nextSchema
      markUpdatedNode(dom, 'text')
    }
    return dom as Text
  }

  // case 5: 같은 타입 element → props / children 비교
  // 이 시점에서 prevSchema도 ElementSchema임이 보장됨
  const prevElement = prevSchema as ElementSchema
  const el = dom as HTMLElement

  updateProps(el, prevElement.props, nextSchema.props)
  updateChildren(el, prevElement.children, nextSchema.children)

  return el
}

function updateProps(dom: HTMLElement, prevProps: Props = {}, nextProps: Props = {}): void {
  let updated = false

  // 존재하지 않는 props 제거
  for (const key of Object.keys(prevProps)) {
    if (!(key in nextProps)) {
      if (key.startsWith('on')) {
        // 이벤트 핸들러 제거
        const eventName = key.slice(2).toLowerCase()
        const handler = prevProps[key]
        if (typeof handler === 'function') {
          dom.removeEventListener(eventName, handler as EventListener)
        }
      } else {
        dom.removeAttribute(key)
      }
      updated = true
    }
  }

  // 신규 props 추가 / 기존 props 변경
  for (const [key, value] of Object.entries(nextProps)) {
    if (prevProps[key] !== value) {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        // 이전 핸들러 제거 후 새 핸들러 등록
        const prevHandler = prevProps[key]
        if (typeof prevHandler === 'function') {
          dom.removeEventListener(eventName, prevHandler as EventListener)
        }
        dom.addEventListener(eventName, value as EventListener)
      } else if (typeof value === 'string') {
        dom.setAttribute(key, value)
      }
      updated = true
    }
  }

  if (updated) {
    markUpdatedNode(dom, 'props')
  }
}

function updateChildren(dom: HTMLElement, prevChildren: Schema[] = [], nextChildren: Schema[] = []): void {
  const maxLength = Math.max(prevChildren.length, nextChildren.length)

  for (let i = 0; i < maxLength; i++) {
    const childDom = dom.childNodes[i]
    const prevChild = prevChildren[i]
    const nextChild = nextChildren[i]

    // childDom이 없으면 새로 생성
    if (!childDom && nextChild !== undefined) {
      const newDom = createElement(nextChild)
      dom.appendChild(newDom)
      markUpdatedNode(dom, 'child')
      continue
    }

    if (childDom) {
      const updatedDom = diff(prevChild, nextChild, childDom)

      if (updatedDom !== childDom) {
        markUpdatedNode(dom, 'child')
      }
    }
  }
}

export { createState, mount }
