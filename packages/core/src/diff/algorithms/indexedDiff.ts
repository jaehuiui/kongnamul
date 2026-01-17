import type { Schema, ElementSchema } from '../../types'
import type { Patch, DiffAlgorithm } from '../types'

/**
 * indexed diff 알고리즘
 * 두 스키마를 인덱스별로 비교하여 Patch 객체를 반환
 */
export const indexedDiff: DiffAlgorithm = (prevSchema: Schema | undefined, nextSchema: Schema | undefined): Patch => {
  // case 1: next schema가 없으면 제거
  if (nextSchema === undefined) {
    return { type: 'remove' }
  }

  // case 2: prev schema가 없으면 신규 생성
  if (prevSchema === undefined) {
    return { type: 'create', schema: nextSchema }
  }

  // case 3: node type이 다르면 교체
  if (compareSchemaTypes(prevSchema, nextSchema)) {
    return { type: 'replace', schema: nextSchema }
  }

  // case 4: leaf node (텍스트 노드)
  if (typeof nextSchema === 'string') {
    if (prevSchema !== nextSchema) {
      return { type: 'text', text: nextSchema }
    }
    return { type: 'none' }
  }

  // case 5: 같은 타입 element → props / children 비교
  const prevElement = prevSchema as ElementSchema
  const prevProps = prevElement.props ?? {}
  const nextProps = nextSchema.props ?? {}
  const prevChildren = prevElement.children ?? []
  const nextChildren = nextSchema.children ?? []

  // children 재귀 연산
  const childPatches = diffChildren(prevChildren, nextChildren)

  return {
    type: 'update',
    prevProps,
    nextProps,
    childPatches,
  }
}

function compareSchemaTypes(prevSchema: Schema, nextSchema: Schema): boolean {
  return (
    typeof prevSchema !== typeof nextSchema ||
    (typeof nextSchema !== 'string' && typeof prevSchema !== 'string' && prevSchema.type !== nextSchema.type)
  )
}

function diffChildren(prevChildren: Schema[], nextChildren: Schema[]): Patch[] {
  const maxLength = Math.max(prevChildren.length, nextChildren.length)
  const childPatches: Patch[] = []

  for (let i = 0; i < maxLength; i++) {
    childPatches.push(indexedDiff(prevChildren[i], nextChildren[i]))
  }

  return childPatches
}
