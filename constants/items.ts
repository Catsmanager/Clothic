// 아바타 코디 아이템 카탈로그 — docs/ASSET_PLAN.md + docs/DATA_MODEL.md 기준.
//
// 주의:
// - imagePath는 require()가 아닌 "문자열 경로"다. PNG 미제작 상태에서도 빌드가
//   깨지지 않도록 의도한 것. 실제 Image 매핑은 에셋 제작 후 Phase 4에서 연결한다.
// - 카테고리는 PRD/ASSET_PLAN 권위에 따라 top/bottom/shoes/bag/accessory 5종.
//   hair는 현재 제품 범위 밖이며, 추후 Category에 추가해 확장할 수 있다.

import { ITEM_CATALOG } from './itemCatalog'

export type Category = 'top' | 'bottom' | 'shoes' | 'bag' | 'accessory'

export type StyleTag =
  | 'casual'
  | 'formal'
  | 'street'
  | 'feminine'
  | 'minimal'
  | 'sporty'
  | 'vintage'
  | 'chic'
  | 'bohemian'
  | 'preppy'

export const STYLE_TAGS: StyleTag[] = [
  'casual',
  'formal',
  'street',
  'feminine',
  'minimal',
  'sporty',
  'vintage',
  'chic',
  'bohemian',
  'preppy',
]

export interface CatalogItem {
  id: string // 스프라이트 식별자, e.g. 'top_001'
  category: Category
  subCategory: string // UI 분류 탭, e.g. '티셔츠'
  name: string // 표시 이름
  color: string // 미리보기/placeholder 색상 (hex)
  imagePath: string // 에셋 경로 (PNG 제작 후 사용). none은 ''
  styleTags: StyleTag[]
}

export const ITEM_CATEGORIES: Category[] = ['top', 'bottom', 'shoes', 'bag', 'accessory']

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  bag: '가방',
  accessory: '악세서리',
}

export const SUB_CATEGORIES: Record<Category, string[]> = {
  top: ['전체', '티셔츠', '블라우스', '니트', '아우터'],
  bottom: ['전체', '팬츠', '스커트', '쇼츠', '레깅스'],
  shoes: ['전체', '스니커즈', '힐', '로퍼', '부츠'],
  bag: ['전체', '숄더백', '토트', '크로스백', '클러치'],
  accessory: ['전체', '모자', '선글라스', '스카프', '기타'],
}

// 레이어 z-order (아래 → 위). base는 별도로 가장 아래에 렌더.
export const RENDER_ORDER: Category[] = ['bottom', 'shoes', 'top', 'bag', 'accessory']

export const ITEMS: CatalogItem[] = ITEM_CATALOG

export function getItemsByCategory(category: Category): CatalogItem[] {
  return ITEMS.filter((item) => item.category === category)
}

export function getItemById(id: string): CatalogItem | undefined {
  return ITEMS.find((item) => item.id === id)
}

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && ITEM_CATEGORIES.includes(value as Category)
}

export function isStyleTag(value: unknown): value is StyleTag {
  return typeof value === 'string' && STYLE_TAGS.includes(value as StyleTag)
}
