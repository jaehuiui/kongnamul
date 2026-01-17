import { markUpdatedNode } from '../debug/debug'
import type { Props, DOMNode } from '../types'
import type { Patch } from '../diff'
import { createElement } from '../dom'

/**
 * Patch 객체를 DOM에 적용
 */
export function patch(dom: DOMNode | ChildNode, patchObj: Patch): DOMNode | null {
  switch (patchObj.type) {
    case 'none':
      return dom as DOMNode

    case 'remove':
      dom.remove()
      return null

    case 'create': {
      const newDom = createElement(patchObj.schema)
      dom.parentNode?.appendChild(newDom)
      return newDom
    }

    case 'replace': {
      const newDom = createElement(patchObj.schema)
      dom.replaceWith(newDom)
      markUpdatedNode(newDom, 'replace')
      return newDom
    }

    case 'text':
      dom.textContent = patchObj.text
      markUpdatedNode(dom, 'text')
      return dom as Text

    case 'update': {
      const el = dom as HTMLElement
      patchProps(el, patchObj.prevProps, patchObj.nextProps)
      patchChildren(el, patchObj.childPatches)
      return el
    }
  }
}

function patchProps(dom: HTMLElement, prevProps: Props, nextProps: Props): void {
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

function patchChildren(dom: HTMLElement, childPatches: Patch[]): void {
  for (let i = 0; i < childPatches.length; i++) {
    const childPatch = childPatches[i]!
    const childDom = dom.childNodes[i]

    // childDom이 없으면 새로 생성
    if (!childDom && childPatch.type === 'create') {
      const newDom = createElement(childPatch.schema)
      dom.appendChild(newDom)
      markUpdatedNode(dom, 'child')
      continue
    }

    if (childDom) {
      const updatedDom = patch(childDom, childPatch)

      if (updatedDom !== childDom) {
        markUpdatedNode(dom, 'child')
      }
    }
  }
}
