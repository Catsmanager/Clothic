import { View } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface Segment {
  value: number
  color: string
}

interface Props {
  segments: Segment[]
  size?: number
  strokeWidth?: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function segmentPath(
  cx: number,
  cy: number,
  r: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, r, startAngle)
  const outerEnd = polarToCartesian(cx, cy, r, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle)
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r} ${r} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

export default function DonutChart({ segments, size = 140, strokeWidth = 36 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const innerR = r - strokeWidth
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  // 각 세그먼트의 시작 각도를 누적 합으로 미리 계산한다(렌더 중 가변 변수 재할당 회피).
  const startAngles = segments.reduce<number[]>((acc, seg, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + (segments[i - 1].value / total) * 360)
    return acc
  }, [])
  const paths = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 360
    const start = startAngles[i]
    const end = start + sweep - 1 // 1도 간격
    return <Path key={i} d={segmentPath(cx, cy, r, innerR, start, end)} fill={seg.color} />
  })

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {paths}
        {/* 중앙 빈 원 (도넛 효과) */}
        <Circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
      </Svg>
    </View>
  )
}
