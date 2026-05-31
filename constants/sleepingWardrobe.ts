export type SleepingCategory = '전체' | '상의' | '하의' | '원피스' | '아우터' | '신발/가방'
export type SortOrder = '오래된 순' | '최신 순'

export interface SleepingItem {
  id: string
  name: string
  tags: string[]
  lastWorn: string
  color: string
  category: Exclude<SleepingCategory, '전체'>
}

export const SLEEPING_ITEMS: SleepingItem[] = [
  {
    id: '1',
    name: '크림 케이블 니트',
    tags: ['니트', '베이지', '루즈핏'],
    lastWorn: '2026.01.15',
    color: '#EDE0C8',
    category: '상의',
  },
  {
    id: '2',
    name: '연청 와이드 데님 팬츠',
    tags: ['데님', '연청', '와이드'],
    lastWorn: '2026.01.12',
    color: '#6B8CAE',
    category: '하의',
  },
  {
    id: '3',
    name: '블랙 롱 코트',
    tags: ['아우터', '블랙', '롱핏'],
    lastWorn: '2026.01.05',
    color: '#1C1C1C',
    category: '아우터',
  },
  {
    id: '4',
    name: '블랙 캔버스 스니커즈',
    tags: ['신발', '블랙', '캐주얼'],
    lastWorn: '2025.12.28',
    color: '#2A2A2A',
    category: '신발/가방',
  },
  {
    id: '5',
    name: '브라운 숄더백',
    tags: ['가방', '브라운', '데일리'],
    lastWorn: '2025.12.20',
    color: '#8A6A4A',
    category: '신발/가방',
  },
  {
    id: '6',
    name: '플라워 롱 원피스',
    tags: ['원피스', '플라워', '롱'],
    lastWorn: '2025.12.18',
    color: '#D4C4A8',
    category: '원피스',
  },
  {
    id: '7',
    name: '화이트 린넨 셔츠',
    tags: ['셔츠', '화이트', '린넨'],
    lastWorn: '2025.12.10',
    color: '#F5F5F5',
    category: '상의',
  },
  {
    id: '8',
    name: '베이지 슬랙스',
    tags: ['슬랙스', '베이지', '와이드'],
    lastWorn: '2025.12.05',
    color: '#C8B89A',
    category: '하의',
  },
  {
    id: '9',
    name: '머스타드 니트 조끼',
    tags: ['니트', '머스타드', '조끼'],
    lastWorn: '2025.11.28',
    color: '#C8A832',
    category: '상의',
  },
  {
    id: '10',
    name: '브라운 앵클부츠',
    tags: ['부츠', '브라운', '앵클'],
    lastWorn: '2025.11.20',
    color: '#7A5A3A',
    category: '신발/가방',
  },
  {
    id: '11',
    name: '플로럴 미디 스커트',
    tags: ['스커트', '플로럴', '미디'],
    lastWorn: '2025.11.15',
    color: '#D4A0A0',
    category: '하의',
  },
  {
    id: '12',
    name: '네이비 블레이저',
    tags: ['블레이저', '네이비', '포멀'],
    lastWorn: '2025.11.10',
    color: '#2C3E6B',
    category: '아우터',
  },
  {
    id: '13',
    name: '화이트 미니 원피스',
    tags: ['원피스', '화이트', '미니'],
    lastWorn: '2025.10.30',
    color: '#EFEFEF',
    category: '원피스',
  },
  {
    id: '14',
    name: '카키 트렌치코트',
    tags: ['코트', '카키', '트렌치'],
    lastWorn: '2025.10.20',
    color: '#7A8A5A',
    category: '아우터',
  },
  {
    id: '15',
    name: '블랙 크로스백',
    tags: ['가방', '블랙', '크로스'],
    lastWorn: '2025.10.15',
    color: '#1C1C1C',
    category: '신발/가방',
  },
  {
    id: '16',
    name: '스트라이프 긴팔티',
    tags: ['티셔츠', '스트라이프', '베이직'],
    lastWorn: '2025.10.08',
    color: '#C8C8C8',
    category: '상의',
  },
  {
    id: '17',
    name: '그레이 조거팬츠',
    tags: ['팬츠', '그레이', '조거'],
    lastWorn: '2025.09.25',
    color: '#8A8A8A',
    category: '하의',
  },
  {
    id: '18',
    name: '카멜 숄더백',
    tags: ['가방', '카멜', '숄더'],
    lastWorn: '2025.09.18',
    color: '#C8944A',
    category: '신발/가방',
  },
]

export const SLEEPING_CATEGORIES: SleepingCategory[] = [
  '전체',
  '상의',
  '하의',
  '원피스',
  '아우터',
  '신발/가방',
]

export const SLEEPING_CATEGORY_COUNT: Record<SleepingCategory, number> = {
  전체: SLEEPING_ITEMS.length,
  상의: SLEEPING_ITEMS.filter((item) => item.category === '상의').length,
  하의: SLEEPING_ITEMS.filter((item) => item.category === '하의').length,
  원피스: SLEEPING_ITEMS.filter((item) => item.category === '원피스').length,
  아우터: SLEEPING_ITEMS.filter((item) => item.category === '아우터').length,
  '신발/가방': SLEEPING_ITEMS.filter((item) => item.category === '신발/가방').length,
}
