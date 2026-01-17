export interface ElementSchema {
  /** HTML 태그 이름 (div, span, button 등) */
  type: string
  /** 요소의 속성 및 이벤트 핸들러 */
  props?: Props
  /** 자식 노드들 */
  children?: Schema[]
}

/**
 * Schema 타입
 * - ElementSchema: HTML 요소 노드
 * - string: 텍스트 노드
 */
export type Schema = ElementSchema | string

/** 이벤트 핸들러 타입 (onClick, onInput 등) */
export type EventHandler<E extends Event = Event> = (event: E) => void

/**
 * Props 객체 타입
 * - 이벤트 핸들러: 'on'으로 시작하는 키 (onClick, onMouseEnter 등)
 * - 일반 속성: string 값을 가지는 속성 (id, class, href 등)
 */
export type Props = {
  [key: `on${string}`]: EventHandler
} & {
  [key: string]: string | EventHandler
}

/**
 * DOM 노드 타입 (Text 또는 Element)
 */
export type DOMNode = Text | HTMLElement
