import { debug, markUpdatedNode } from './debug'

let container = null
let createSchema = null

let prevSchema = null
let rootNode = null

function createState(initialState) {
  let state = initialState

  return {
    get: () => state,
    set: nextState => {
      state = nextState
      updateDOM()
    },
  }
}

function mount(_createSchema, _container) {
  createSchema = _createSchema
  container = _container

  updateDOM()
}

function updateDOM() {
  const schema = createSchema()
  render(schema, container)
}

function render(schema, container) {
  // 최초 mount 동작
  if (!prevSchema) {
    rootNode = createElement(schema)
    container.appendChild(rootNode)
  }
  // 이후 리렌더링 동작
  else {
    rootNode = diff(prevSchema, schema, rootNode)
  }

  // 이전 schema 업데이트
  prevSchema = schema
}

function createElement(schema) {
  // Leaf Node: create text node
  if (typeof schema === 'string') {
    const textNode = document.createTextNode(schema)
    return textNode
  }

  // Parent Node: create element
  const el = document.createElement(schema.type)

  // Element: map props
  if (schema.props) {
    Object.entries(schema.props).forEach(([key, value]) => {
      // Props: register event handler
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        el.addEventListener(eventName, value)
      }
      // Props: register other props
      else {
        el.setAttribute(key, value)
      }
    })
  }

  // Element: render children recursively
  if (schema.children) {
    schema.children.forEach(child => {
      el.appendChild(createElement(child))
    })
  }

  return el
}

function diff(prevSchema, nextSchema, dom) {
  // case 1: next schema가 없으면 제거
  if (!nextSchema) {
    dom.remove()
    return null
  }

  // case 2: prev schema가 없으면 신규 생성
  if (!prevSchema) {
    const newDom = createElement(nextSchema)
    dom.appendChild(newDom)
    return newDom
  }

  // case 3: node type이 다르면 교체
  if (
    typeof prevSchema !== typeof nextSchema ||
    (typeof nextSchema !== 'string' && prevSchema.type !== nextSchema.type)
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
    return dom
  }

  // case 5: 같은 타입 element → props / children 비교
  updateProps(dom, prevSchema.props, nextSchema.props)
  updateChildren(dom, prevSchema.children, nextSchema.children)

  return dom
}

function updateProps(dom, prevProps = {}, nextProps = {}) {
  let updated = false

  // 존재하지 않는 props 제거
  Object.keys(prevProps).forEach(key => {
    if (!(key in nextProps)) {
      dom.removeAttribute(key)
      updated = true
    }
  })

  // 신규 props 추가 / 기존 props 변경
  Object.entries(nextProps).forEach(([key, value]) => {
    if (prevProps[key] !== value) {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        dom[eventName] = value
      } else {
        dom.setAttribute(key, value)
      }
      updated = true
    }
  })

  if (updated) {
    markUpdatedNode(dom, 'props')
  }
}

function updateChildren(dom, prevChildren = [], nextChildren = []) {
  const maxLength = Math.max(prevChildren.length, nextChildren.length)

  for (let i = 0; i < maxLength; i++) {
    const childDom = dom.childNodes[i]
    const updatedDom = diff(prevChildren[i], nextChildren[i], childDom)

    if (updatedDom !== childDom) {
      markUpdatedNode(dom, 'child')
    }
  }
}

export { createState, mount, debug }
