export type Category = 'hair' | 'top' | 'bottom' | 'shoes' | 'bag' | 'accessory'

export interface MockItem {
  id: string
  category: Category
  subCategory: string
  label: string
  color: string
}

export const SUB_CATEGORIES: Record<Category, string[]> = {
  hair: ['전체', '단발', '긴머리', '묶음', '업스타일'],
  top: ['전체', '티셔츠', '블라우스', '니트', '아우터'],
  bottom: ['전체', '팬츠', '스커트', '쇼츠', '레깅스'],
  shoes: ['전체', '스니커즈', '힐', '로퍼', '부츠'],
  bag: ['전체', '숄더백', '토트', '크로스백', '클러치'],
  accessory: ['전체', '모자', '선글라스', '스카프', '기타'],
}

export const CATEGORY_LABELS: Record<Category, string> = {
  hair: '헤어',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  bag: '가방',
  accessory: '악세서리',
}

// 에셋 제작 전 placeholder — 색상으로 구분
export const MOCK_ITEMS: MockItem[] = [
  { id: 'top_001', category: 'top', subCategory: '티셔츠', label: '블랙 민소매', color: '#1C1C1C' },
  { id: 'top_002', category: 'top', subCategory: '티셔츠', label: '화이트 티', color: '#F5F5F5' },
  {
    id: 'top_003',
    category: 'top',
    subCategory: '티셔츠',
    label: '그레이 민소매',
    color: '#8A8A8A',
  },
  { id: 'top_004', category: 'top', subCategory: '티셔츠', label: '스트라이프', color: '#C8C8C8' },
  { id: 'top_005', category: 'top', subCategory: '티셔츠', label: '그레이 티', color: '#A0A0A0' },
  { id: 'top_006', category: 'top', subCategory: '티셔츠', label: '블랙 티', color: '#2A2A2A' },
  {
    id: 'top_007',
    category: 'top',
    subCategory: '아우터',
    label: '베이지 가디건',
    color: '#D4C4A8',
  },
  {
    id: 'top_008',
    category: 'top',
    subCategory: '블라우스',
    label: '화이트 블라우스',
    color: '#FAFAFA',
  },
  { id: 'top_009', category: 'top', subCategory: '니트', label: '크림 니트', color: '#EDE0C8' },
  { id: 'top_010', category: 'top', subCategory: '니트', label: '네이비 니트', color: '#2C3E6B' },

  {
    id: 'bottom_001',
    category: 'bottom',
    subCategory: '쇼츠',
    label: '데님 쇼츠',
    color: '#6B8CAE',
  },
  {
    id: 'bottom_002',
    category: 'bottom',
    subCategory: '팬츠',
    label: '블랙 팬츠',
    color: '#1C1C1C',
  },
  {
    id: 'bottom_003',
    category: 'bottom',
    subCategory: '스커트',
    label: '베이지 스커트',
    color: '#C8B89A',
  },
  {
    id: 'bottom_004',
    category: 'bottom',
    subCategory: '팬츠',
    label: '그레이 팬츠',
    color: '#7A7A7A',
  },
  {
    id: 'bottom_005',
    category: 'bottom',
    subCategory: '레깅스',
    label: '블랙 레깅스',
    color: '#1A1A1A',
  },
  {
    id: 'bottom_006',
    category: 'bottom',
    subCategory: '스커트',
    label: '화이트 미니',
    color: '#EFEFEF',
  },
  {
    id: 'bottom_007',
    category: 'bottom',
    subCategory: '쇼츠',
    label: '카키 쇼츠',
    color: '#7A8A6A',
  },
  {
    id: 'bottom_008',
    category: 'bottom',
    subCategory: '팬츠',
    label: '크림 팬츠',
    color: '#E8DCC8',
  },

  {
    id: 'shoes_001',
    category: 'shoes',
    subCategory: '스니커즈',
    label: '화이트 스니커즈',
    color: '#F0F0F0',
  },
  { id: 'shoes_002', category: 'shoes', subCategory: '부츠', label: '블랙 부츠', color: '#1C1C1C' },
  {
    id: 'shoes_003',
    category: 'shoes',
    subCategory: '로퍼',
    label: '베이지 로퍼',
    color: '#C8A882',
  },
  { id: 'shoes_004', category: 'shoes', subCategory: '힐', label: '누드 힐', color: '#D4B09A' },
  {
    id: 'shoes_005',
    category: 'shoes',
    subCategory: '스니커즈',
    label: '블랙 스니커즈',
    color: '#2A2A2A',
  },
  {
    id: 'shoes_006',
    category: 'shoes',
    subCategory: '부츠',
    label: '브라운 부츠',
    color: '#7A5A3A',
  },

  {
    id: 'bag_001',
    category: 'bag',
    subCategory: '숄더백',
    label: '베이지 숄더백',
    color: '#C8B89A',
  },
  { id: 'bag_002', category: 'bag', subCategory: '토트', label: '크림 토트', color: '#E8DCC8' },
  {
    id: 'bag_003',
    category: 'bag',
    subCategory: '크로스백',
    label: '블랙 크로스백',
    color: '#1C1C1C',
  },
  {
    id: 'bag_004',
    category: 'bag',
    subCategory: '숄더백',
    label: '브라운 숄더백',
    color: '#8A6A4A',
  },
  {
    id: 'bag_005',
    category: 'bag',
    subCategory: '클러치',
    label: '화이트 클러치',
    color: '#F5F5F5',
  },

  {
    id: 'hair_001',
    category: 'hair',
    subCategory: '긴머리',
    label: '브라운 긴머리',
    color: '#8A6A3A',
  },
  { id: 'hair_002', category: 'hair', subCategory: '단발', label: '블랙 단발', color: '#1C1C1C' },
  { id: 'hair_003', category: 'hair', subCategory: '묶음', label: '포니테일', color: '#6A4A2A' },
  {
    id: 'hair_004',
    category: 'hair',
    subCategory: '긴머리',
    label: '웨이브 긴머리',
    color: '#A07850',
  },

  {
    id: 'acc_001',
    category: 'accessory',
    subCategory: '모자',
    label: '카키 베레모',
    color: '#6A7A5A',
  },
  {
    id: 'acc_002',
    category: 'accessory',
    subCategory: '선글라스',
    label: '블랙 선글라스',
    color: '#1C1C1C',
  },
  {
    id: 'acc_003',
    category: 'accessory',
    subCategory: '스카프',
    label: '베이지 스카프',
    color: '#D4C4A8',
  },
  {
    id: 'acc_004',
    category: 'accessory',
    subCategory: '기타',
    label: '없음',
    color: 'transparent',
  },
]
