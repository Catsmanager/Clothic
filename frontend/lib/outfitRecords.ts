import type { Outfit } from '../stores/outfitStore'

export function isStyledOutfit(outfit: Pick<Outfit, 'itemIds'>): boolean {
  return outfit.itemIds.length > 0
}

type DatedOutfit = Pick<Outfit, 'createdAt' | 'date' | 'id' | 'itemIds'>

function isNewerRepresentative(candidate: DatedOutfit, current: DatedOutfit): boolean {
  const createdAtComparison = candidate.createdAt.localeCompare(current.createdAt)
  if (createdAtComparison !== 0) return createdAtComparison > 0
  return candidate.id.localeCompare(current.id) > 0
}

/**
 * 날짜별 대표 코디를 고른다.
 *
 * 기존 DB는 한 날짜에 여러 row를 허용하므로 데이터를 삭제하거나 숨기지 않는다. 대신 핵심 화면과
 * 습관 지표에서는 아이템이 있는 row 중 가장 최근 createdAt(동률이면 id가 큰 값) 하나만 사용한다.
 */
export function indexPrimaryStyledOutfitsByDate<T extends DatedOutfit>(
  outfits: readonly T[]
): Map<string, T> {
  const primaryByDate = new Map<string, T>()

  outfits.forEach((outfit) => {
    if (!isStyledOutfit(outfit)) return
    const current = primaryByDate.get(outfit.date)
    if (!current || isNewerRepresentative(outfit, current)) {
      primaryByDate.set(outfit.date, outfit)
    }
  })

  return primaryByDate
}

export function getPrimaryStyledOutfits<T extends DatedOutfit>(outfits: readonly T[]): T[] {
  return [...indexPrimaryStyledOutfitsByDate(outfits).values()].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
}
