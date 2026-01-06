let container = null
let createSchema = null

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
  container.innerHTML = ''

  const schema = createSchema()
  render(schema, container)
}

function render(schema, container) {
  // Leaf Node: create text node
  if (typeof schema === 'string') {
    const textNode = document.createTextNode(schema)
    container.appendChild(textNode)
    return
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
      render(child, el)
    })
  }

  // Element: connect to DOM dynamically
  container.appendChild(el)
}

export { createState, mount }
