import { ITEMS, type CatalogItem, type Category, type StyleTag } from '../constants/items'

export interface UserItem {
  id: string
  userId: string
  catalogItemId: string | null
  name: string
  category: Category
  imagePath: string
  color: string
  styleTags: StyleTag[]
  createdAt: string
}

function findTemplate(item: UserItem): CatalogItem | undefined {
  return item.catalogItemId
    ? ITEMS.find((candidate) => candidate.id === item.catalogItemId)
    : undefined
}

export function userItemToCatalogItem(item: UserItem): CatalogItem {
  const template = findTemplate(item)

  return {
    id: item.id,
    assetId: template?.id,
    category: item.category,
    subCategory: template?.subCategory ?? '내 아이템',
    name: item.name,
    color: item.color,
    imagePath: item.imagePath,
    styleTags: item.styleTags,
    seasons: template?.seasons ?? ['all'],
  }
}

export function buildOwnedCatalogItems(userItems: UserItem[]): CatalogItem[] {
  return userItems.map(userItemToCatalogItem)
}

// 기존 코디는 정적 catalog id, 신규 코디는 사용자 item UUID를 저장한다.
// 조회 화면에서는 두 형태를 모두 해석해 과거 기록을 보존한다.
export function buildResolvableCatalogItems(userItems: UserItem[]): CatalogItem[] {
  return [...ITEMS, ...buildOwnedCatalogItems(userItems)]
}

// 통계·챌린지는 사용자가 보유를 확인한 옷만 사용한다.
// catalog alias는 과거 코디의 정적 id를 확인된 사용자 아이템에 연결한다.
export function buildAnalyticsCatalogItems(userItems: UserItem[]): CatalogItem[] {
  const ownedItems = buildOwnedCatalogItems(userItems)
  const legacyAliases = ownedItems.flatMap((item) =>
    item.assetId ? [{ ...item, id: item.assetId }] : []
  )

  return [...ownedItems, ...legacyAliases]
}
