// 아바타 코디 아이템 카탈로그 — docs/ASSET_PLAN.md + docs/DATA_MODEL.md 기준.
//
// 주의:
// - imagePath는 require()가 아닌 "문자열 경로"다. 실제 Image 매핑은 lib/avatarAssets.ts에서 연결한다.
// - 카테고리는 top/outer/bottom/dress/shoes/hair/accessory 7종.
//   가방은 별도 카테고리가 아니라 accessory의 서브카테고리로 제공한다.

import { ITEM_CATALOG } from './itemCatalog'

export type Category = 'top' | 'outer' | 'bottom' | 'dress' | 'shoes' | 'hair' | 'accessory'

// 아이템 계절 메타데이터. 앱 내부 분류 전용이며 사용자가 직접 설정하지 않는다.
// 'all'은 사철 착용 가능. 여러 계절에 입는 아이템은 복수 값을 가진다.
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all'

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
  assetId?: string // 사용자 아이템이 재사용하는 정적 스프라이트 ID
  category: Category
  subCategory: string // UI 분류 탭, e.g. '티셔츠'
  name: string // 표시 이름
  color: string // 미리보기/placeholder 색상 (hex)
  imagePath: string // 에셋 경로 (PNG 제작 후 사용). none은 ''
  styleTags: StyleTag[]
  seasons: Season[] // 내부 계절 메타데이터 (잠자는 옷장 분류용)
}

export const ITEM_CATEGORIES: Category[] = [
  'top',
  'outer',
  'bottom',
  'dress',
  'shoes',
  'hair',
  'accessory',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '상의',
  outer: '아우터',
  bottom: '하의',
  dress: '원피스',
  shoes: '신발',
  hair: '헤어',
  accessory: '악세서리',
}

export const SUB_CATEGORIES: Record<Category, string[]> = {
  top: ['전체', '티셔츠', '나시', '블라우스', '니트', '맨투맨', '셔츠'],
  outer: ['전체', '가디건', '자켓', '코트', '후드집업'],
  bottom: ['전체', '팬츠', '스커트', '쇼츠', '레깅스'],
  dress: ['전체', '미니 원피스', '롱 원피스'],
  shoes: ['전체', '스니커즈', '힐', '로퍼', '부츠', '구두'],
  hair: ['전체'],
  accessory: ['전체', '선글라스', '안경', '스카프', '가방', '니삭스', '목걸이', '시계', '기타'],
}

// 레이어 z-order (아래 → 위). base는 별도로 가장 아래에 렌더.
// 기본적으로 신발은 모델 위, 하의 아래에 둔다. 아이템별 오버라이드는 lib/avatarAssets.ts에서 처리한다.
export const RENDER_ORDER: Category[] = [
  'shoes',
  'bottom',
  'dress',
  'top',
  'outer',
  'hair',
  'accessory',
]

// 색상 선택·통계 집계 대상 카테고리.
// 옷 본체의 색을 대표한다. 신발·헤어·악세서리는 색 선택 피로도·통계 노이즈만 키우므로 제외.
export const COLOR_CATEGORIES: Category[] = ['top', 'outer', 'bottom', 'dress']

export function isColorCategory(category: Category): boolean {
  return COLOR_CATEGORIES.includes(category)
}

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
