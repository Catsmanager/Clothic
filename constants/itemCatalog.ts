import type { CatalogItem } from './items'

// 실제 PNG 에셋이 제작된 아이템만 등록한다. (목데이터 금지)
// 에셋이 없는 카테고리(hair, accessory)는 UI에서 "추후 업데이트" 빈 상태로 안내한다.
export const ITEM_CATALOG: CatalogItem[] = [
  // top
  {
    id: 'top_002',
    category: 'top',
    subCategory: '티셔츠',
    name: '브이넥 무지 티',
    color: '#F5F5F5',
    imagePath: 'assets/avatar/top/top_002_white.png',
    styleTags: ['casual', 'minimal'],
  },

  // bottom
  {
    id: 'bottom_009',
    category: 'bottom',
    subCategory: '스커트',
    name: '청색 치마',
    color: '#9CB8CC',
    imagePath: 'assets/avatar/bottom/bottom_009_blue.png',
    styleTags: ['casual', 'feminine'],
  },
  {
    id: 'bottom_010',
    category: 'bottom',
    subCategory: '팬츠',
    name: '청 와이드 팬츠',
    color: '#9CB8CC',
    imagePath: 'assets/avatar/bottom/bottom_010_blue.png',
    styleTags: ['casual', 'street'],
  },
  {
    id: 'bottom_011',
    category: 'bottom',
    subCategory: '팬츠',
    name: '트레이닝 팬츠',
    color: '#C8C6CA',
    imagePath: 'assets/avatar/bottom/bottom_011_gray.png',
    styleTags: ['casual', 'sporty'],
  },

  // shoes
  {
    id: 'shoes_001',
    category: 'shoes',
    subCategory: '스니커즈',
    name: '스니커즈',
    color: '#F0F0F0',
    imagePath: 'assets/avatar/shoes/shoes_001_white.png',
    styleTags: ['casual', 'sporty'],
  },
  {
    id: 'shoes_002',
    category: 'shoes',
    subCategory: '부츠',
    name: '부츠',
    color: '#1C1C1C',
    imagePath: 'assets/avatar/shoes/shoes_002_black.png',
    styleTags: ['street', 'chic'],
  },
  {
    id: 'shoes_007',
    category: 'shoes',
    subCategory: '구두',
    name: '구두',
    color: '#111111',
    imagePath: 'assets/avatar/shoes/shoes_007_black.png',
    styleTags: ['formal', 'chic'],
  },
]
