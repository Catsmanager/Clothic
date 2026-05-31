// 아바타 코디 아이템 카탈로그 — docs/ASSET_PLAN.md + docs/DATA_MODEL.md 기준.
//
// 주의:
// - imagePath는 require()가 아닌 "문자열 경로"다. PNG 미제작 상태에서도 빌드가
//   깨지지 않도록 의도한 것. 실제 Image 매핑은 에셋 제작 후 Phase 4에서 연결한다.
// - 카테고리는 PRD/ASSET_PLAN 권위에 따라 top/bottom/shoes/bag/accessory 5종.
//   (현재 UI(constants/mockItems.ts)에는 'hair'가 있으나 문서 범위 밖 — 별도 결정 필요)

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

export interface CatalogItem {
  id: string // 스프라이트 식별자, e.g. 'top_001'
  category: Category
  subCategory: string // UI 분류 탭, e.g. '티셔츠'
  name: string // 표시 이름
  color: string // 미리보기/placeholder 색상 (hex)
  imagePath: string // 에셋 경로 (PNG 제작 후 사용). none은 ''
  styleTags: StyleTag[]
}

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  bag: '가방',
  accessory: '악세서리',
}

// 레이어 z-order (아래 → 위). base는 별도로 가장 아래에 렌더.
export const RENDER_ORDER: Category[] = ['bottom', 'shoes', 'top', 'bag', 'accessory']

export const ITEMS: CatalogItem[] = [
  // top (10)
  {
    id: 'top_001',
    category: 'top',
    subCategory: '티셔츠',
    name: '블랙 민소매',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/top/top_001_black.png',
    styleTags: ['minimal', 'chic'],
  },
  {
    id: 'top_002',
    category: 'top',
    subCategory: '티셔츠',
    name: '화이트 티',
    color: '#F5F5F5',
    imagePath: 'assets/avatar/top/top_002_white.png',
    styleTags: ['casual', 'minimal'],
  },
  {
    id: 'top_003',
    category: 'top',
    subCategory: '티셔츠',
    name: '그레이 민소매',
    color: '#8A8A8A',
    imagePath: 'assets/avatar/top/top_003_gray.png',
    styleTags: ['minimal', 'sporty'],
  },
  {
    id: 'top_004',
    category: 'top',
    subCategory: '티셔츠',
    name: '스트라이프',
    color: '#C8C8C8',
    imagePath: 'assets/avatar/top/top_004_stripe.png',
    styleTags: ['casual', 'preppy'],
  },
  {
    id: 'top_005',
    category: 'top',
    subCategory: '티셔츠',
    name: '그레이 티',
    color: '#A0A0A0',
    imagePath: 'assets/avatar/top/top_005_gray.png',
    styleTags: ['casual', 'minimal'],
  },
  {
    id: 'top_006',
    category: 'top',
    subCategory: '티셔츠',
    name: '블랙 티',
    color: '#2A2A2A',
    imagePath: 'assets/avatar/top/top_006_black.png',
    styleTags: ['casual', 'street'],
  },
  {
    id: 'top_007',
    category: 'top',
    subCategory: '아우터',
    name: '베이지 가디건',
    color: '#D4C4A8',
    imagePath: 'assets/avatar/top/top_007_beige.png',
    styleTags: ['feminine', 'preppy'],
  },
  {
    id: 'top_008',
    category: 'top',
    subCategory: '블라우스',
    name: '화이트 블라우스',
    color: '#FAFAFA',
    imagePath: 'assets/avatar/top/top_008_white.png',
    styleTags: ['formal', 'feminine'],
  },
  {
    id: 'top_009',
    category: 'top',
    subCategory: '니트',
    name: '크림 니트',
    color: '#EDE0C8',
    imagePath: 'assets/avatar/top/top_009_beige.png',
    styleTags: ['feminine', 'minimal'],
  },
  {
    id: 'top_010',
    category: 'top',
    subCategory: '니트',
    name: '네이비 니트',
    color: '#2C3E6B',
    imagePath: 'assets/avatar/top/top_010_navy.png',
    styleTags: ['preppy', 'minimal'],
  },

  // bottom (8)
  {
    id: 'bottom_001',
    category: 'bottom',
    subCategory: '쇼츠',
    name: '데님 쇼츠',
    color: '#6B8CAE',
    imagePath: 'assets/avatar/bottom/bottom_001_denim.png',
    styleTags: ['casual', 'street'],
  },
  {
    id: 'bottom_002',
    category: 'bottom',
    subCategory: '팬츠',
    name: '블랙 팬츠',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/bottom/bottom_002_black.png',
    styleTags: ['minimal', 'formal'],
  },
  {
    id: 'bottom_003',
    category: 'bottom',
    subCategory: '스커트',
    name: '베이지 스커트',
    color: '#C8B89A',
    imagePath: 'assets/avatar/bottom/bottom_003_beige.png',
    styleTags: ['feminine', 'chic'],
  },
  {
    id: 'bottom_004',
    category: 'bottom',
    subCategory: '팬츠',
    name: '그레이 팬츠',
    color: '#7A7A7A',
    imagePath: 'assets/avatar/bottom/bottom_004_gray.png',
    styleTags: ['minimal', 'formal'],
  },
  {
    id: 'bottom_005',
    category: 'bottom',
    subCategory: '레깅스',
    name: '블랙 레깅스',
    color: '#1A1A1A',
    imagePath: 'assets/avatar/bottom/bottom_005_black.png',
    styleTags: ['sporty', 'casual'],
  },
  {
    id: 'bottom_006',
    category: 'bottom',
    subCategory: '스커트',
    name: '화이트 미니',
    color: '#EFEFEF',
    imagePath: 'assets/avatar/bottom/bottom_006_white.png',
    styleTags: ['feminine', 'chic'],
  },
  {
    id: 'bottom_007',
    category: 'bottom',
    subCategory: '쇼츠',
    name: '카키 쇼츠',
    color: '#7A8A6A',
    imagePath: 'assets/avatar/bottom/bottom_007_green.png',
    styleTags: ['casual', 'street'],
  },
  {
    id: 'bottom_008',
    category: 'bottom',
    subCategory: '팬츠',
    name: '크림 팬츠',
    color: '#E8DCC8',
    imagePath: 'assets/avatar/bottom/bottom_008_beige.png',
    styleTags: ['minimal', 'chic'],
  },

  // shoes (6)
  {
    id: 'shoes_001',
    category: 'shoes',
    subCategory: '스니커즈',
    name: '화이트 스니커즈',
    color: '#F0F0F0',
    imagePath: 'assets/avatar/shoes/shoes_001_white.png',
    styleTags: ['casual', 'sporty'],
  },
  {
    id: 'shoes_002',
    category: 'shoes',
    subCategory: '부츠',
    name: '블랙 부츠',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/shoes/shoes_002_black.png',
    styleTags: ['street', 'chic'],
  },
  {
    id: 'shoes_003',
    category: 'shoes',
    subCategory: '로퍼',
    name: '베이지 로퍼',
    color: '#C8A882',
    imagePath: 'assets/avatar/shoes/shoes_003_beige.png',
    styleTags: ['preppy', 'formal'],
  },
  {
    id: 'shoes_004',
    category: 'shoes',
    subCategory: '힐',
    name: '누드 힐',
    color: '#D4B09A',
    imagePath: 'assets/avatar/shoes/shoes_004_beige.png',
    styleTags: ['formal', 'feminine'],
  },
  {
    id: 'shoes_005',
    category: 'shoes',
    subCategory: '스니커즈',
    name: '블랙 스니커즈',
    color: '#2A2A2A',
    imagePath: 'assets/avatar/shoes/shoes_005_black.png',
    styleTags: ['casual', 'street'],
  },
  {
    id: 'shoes_006',
    category: 'shoes',
    subCategory: '부츠',
    name: '브라운 부츠',
    color: '#7A5A3A',
    imagePath: 'assets/avatar/shoes/shoes_006_brown.png',
    styleTags: ['vintage', 'chic'],
  },

  // bag (5)
  {
    id: 'bag_001',
    category: 'bag',
    subCategory: '숄더백',
    name: '베이지 숄더백',
    color: '#C8B89A',
    imagePath: 'assets/avatar/bag/bag_001_beige.png',
    styleTags: ['minimal', 'chic'],
  },
  {
    id: 'bag_002',
    category: 'bag',
    subCategory: '토트',
    name: '크림 토트',
    color: '#E8DCC8',
    imagePath: 'assets/avatar/bag/bag_002_beige.png',
    styleTags: ['casual', 'minimal'],
  },
  {
    id: 'bag_003',
    category: 'bag',
    subCategory: '크로스백',
    name: '블랙 크로스백',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/bag/bag_003_black.png',
    styleTags: ['street', 'minimal'],
  },
  {
    id: 'bag_004',
    category: 'bag',
    subCategory: '숄더백',
    name: '브라운 숄더백',
    color: '#8A6A4A',
    imagePath: 'assets/avatar/bag/bag_004_brown.png',
    styleTags: ['vintage', 'chic'],
  },
  {
    id: 'bag_005',
    category: 'bag',
    subCategory: '클러치',
    name: '화이트 클러치',
    color: '#F5F5F5',
    imagePath: 'assets/avatar/bag/bag_005_white.png',
    styleTags: ['formal', 'feminine'],
  },

  // accessory (4, none 포함)
  {
    id: 'accessory_001',
    category: 'accessory',
    subCategory: '모자',
    name: '베레모',
    color: '#6A7A5A',
    imagePath: 'assets/avatar/accessory/accessory_001_hat.png',
    styleTags: ['vintage', 'bohemian'],
  },
  {
    id: 'accessory_002',
    category: 'accessory',
    subCategory: '선글라스',
    name: '선글라스',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/accessory/accessory_002_sunglasses.png',
    styleTags: ['street', 'chic'],
  },
  {
    id: 'accessory_003',
    category: 'accessory',
    subCategory: '스카프',
    name: '스카프',
    color: '#D4C4A8',
    imagePath: 'assets/avatar/accessory/accessory_003_scarf.png',
    styleTags: ['feminine', 'bohemian'],
  },
  {
    id: 'accessory_004',
    category: 'accessory',
    subCategory: '기타',
    name: '없음',
    color: 'transparent',
    imagePath: '',
    styleTags: [],
  },
]

export function getItemsByCategory(category: Category): CatalogItem[] {
  return ITEMS.filter((item) => item.category === category)
}

export function getItemById(id: string): CatalogItem | undefined {
  return ITEMS.find((item) => item.id === id)
}
