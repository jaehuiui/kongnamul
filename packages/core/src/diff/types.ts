import type { Schema, Props } from '../types'

/** 변경 없음 */
export interface None {
  type: 'none'
}

/** 노드 제거 */
export interface Remove {
  type: 'remove'
}

/** 새 노드 생성 */
export interface Create {
  type: 'create'
  schema: Schema
}

/** 노드 교체 */
export interface Replace {
  type: 'replace'
  schema: Schema
}

/** 텍스트 노드 내용 변경 */
export interface Text {
  type: 'text'
  text: string
}

/** props 또는 children 업데이트 */
export interface Update {
  type: 'update'
  prevProps: Props
  nextProps: Props
  childPatches: Patch[]
}

/**
 * Patch 타입
 * diff 결과로 생성되어 patch 함수에서 DOM에 적용됨
 */
export type Patch = None | Remove | Create | Replace | Text | Update

/**
 * Diff 알고리즘 인터페이스
 * 다양한 diff 알고리즘을 slot처럼 교체하여 사용 가능
 */
export type DiffAlgorithm = (prevSchema: Schema | undefined, nextSchema: Schema | undefined) => Patch
