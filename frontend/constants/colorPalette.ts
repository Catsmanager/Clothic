// 앱 공통 색상 팔레트 — 아이템 등록 색상 선택지이자 통계 색상명 매핑 기준.
// 카탈로그/사용자 아이템의 hex는 이 8색 중 최근접 색으로 묶어 이름을 부여한다.
export interface PaletteColor {
  hex: string
  name: string
}

export const COLOR_PALETTE: PaletteColor[] = [
  { hex: '#1C1C1C', name: '블랙' },
  { hex: '#F5F5F5', name: '화이트' },
  { hex: '#A0A0A0', name: '그레이' },
  { hex: '#6B8CAE', name: '블루' },
  { hex: '#C8B89A', name: '베이지' },
  { hex: '#8A6A4A', name: '브라운' },
  { hex: '#6F8A7A', name: '그린' },
  { hex: '#C0616B', name: '레드' },
]

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (match == null) return null

  const value = parseInt(match[1], 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

// hex를 팔레트 최근접 색으로 매핑한다. 파싱 불가한 값은 원본 그대로 반환(범례 표시는 가능하게).
export function resolvePaletteColor(hex: string): PaletteColor {
  const rgb = hexToRgb(hex)
  if (rgb == null) return { hex, name: hex }

  let nearest = COLOR_PALETTE[0]
  let nearestDistance = Number.POSITIVE_INFINITY

  COLOR_PALETTE.forEach((candidate) => {
    const candidateRgb = hexToRgb(candidate.hex)
    if (candidateRgb == null) return

    const distance =
      (rgb[0] - candidateRgb[0]) ** 2 +
      (rgb[1] - candidateRgb[1]) ** 2 +
      (rgb[2] - candidateRgb[2]) ** 2
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = candidate
    }
  })

  return nearest
}
