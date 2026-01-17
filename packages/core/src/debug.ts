export type DiffType = 'replace' | 'text' | 'props' | 'child'

let debugMode = false
const HIGHLIGHT_DURATION = 200

export function debug(enabled: boolean = true): void {
  debugMode = enabled
}

export function markUpdatedNode(node: Node | null, type: DiffType): void {
  if (!debugMode || !node) return

  // 텍스트 노드는 setAttribute가 없으므로 부모 노드에 마킹
  const targetNode = node.nodeType === Node.TEXT_NODE ? node.parentNode : (node as HTMLElement)

  if (!targetNode || !(targetNode instanceof HTMLElement)) return

  targetNode.setAttribute('data-diff', type)

  // 시각적으로 확인 가능하도록 일정 시간 후 속성 제거
  setTimeout(() => {
    targetNode.removeAttribute('data-diff')
  }, HIGHLIGHT_DURATION)
}
