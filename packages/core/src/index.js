export function render(snapshot, container) {
  const el = document.createElement(snapshot.type)
  const text = document.createTextNode(snapshot.content)
  el.appendChild(text)

  container.appendChild(el)
}
