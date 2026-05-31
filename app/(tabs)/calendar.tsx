import { useState, useMemo } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'

const BASE_AVATAR = require('../../assets/avatar/base/base_female_01.png')

const SCREEN_WIDTH = Dimensions.get('window').width
const CELL_WIDTH = Math.floor(SCREEN_WIDTH / 7)

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = new Date()
const TODAY_STR = toDateKey(TODAY)

// ── mock 코디 데이터 ──────────────────────────────────────────────
interface MockOutfit {
  items: Array<{ color: string; label: string }>
  memo: string
  weather: string
}

const MOCK_OUTFITS: Record<string, MockOutfit> = {
  '2026-05-01': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '학교 가는 날',
    weather: '☀️ 20°C',
  },
  '2026-05-02': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#FAFAFA', label: '블라우스' },
      { color: '#6B8CAE', label: '데님' },
      { color: '#F0F0F0', label: '스니커즈' },
      { color: '#C8B89A', label: '숄더백' },
    ],
    memo: '카페 작업',
    weather: '☁️ 18°C',
  },
  '2026-05-03': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#EDE0C8', label: '크림 니트' },
      { color: '#E8DCC8', label: '크림 팬츠' },
      { color: '#C8A882', label: '로퍼' },
      { color: '#E8DCC8', label: '토트백' },
    ],
    memo: '주말 나들이',
    weather: '⛅ 19°C',
  },
  '2026-05-04': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#D4C4A8', label: '가디건' },
      { color: '#7A7A7A', label: '그레이 팬츠' },
      { color: '#2A2A2A', label: '블랙 스니커즈' },
      { color: '#8A6A4A', label: '브라운 백' },
    ],
    memo: '친구 만남',
    weather: '☀️ 22°C',
  },
  '2026-05-05': {
    items: [
      { color: '#6A4A2A', label: '묶음' },
      { color: '#F5F5F5', label: '화이트 티' },
      { color: '#1C1C1C', label: '블랙 팬츠' },
      { color: '#F0F0F0', label: '화이트 스니커즈' },
      { color: '#C8B89A', label: '베이지 백' },
    ],
    memo: '어린이날',
    weather: '☀️ 24°C',
  },
  '2026-05-06': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#7A7A7A', label: '그레이 팬츠' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '크로스백' },
    ],
    memo: '일상',
    weather: '☁️ 17°C',
  },
  '2026-05-08': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#FAFAFA', label: '블라우스' },
      { color: '#C8B89A', label: '베이지 스커트' },
      { color: '#F0F0F0', label: '스니커즈' },
      { color: '#C8B89A', label: '숄더백' },
    ],
    memo: '데이트',
    weather: '☀️ 23°C',
  },
  '2026-05-09': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#1A1A1A', label: '레깅스' },
      { color: '#2A2A2A', label: '블랙 스니커즈' },
      { color: '#1C1C1C', label: '미니백' },
    ],
    memo: '운동',
    weather: '☀️ 21°C',
  },
  '2026-05-12': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '회의',
    weather: '🌧️ 15°C',
  },
  '2026-05-13': {
    items: [
      { color: '#6A4A2A', label: '묶음' },
      { color: '#FAFAFA', label: '화이트 탑' },
      { color: '#EFEFEF', label: '화이트 미니' },
      { color: '#F0F0F0', label: '스니커즈' },
      { color: '#F5F5F5', label: '클러치' },
    ],
    memo: '쇼핑',
    weather: '☀️ 25°C',
  },
  '2026-05-15': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#F5F5F5', label: '화이트 티' },
      { color: '#6B8CAE', label: '데님' },
      { color: '#C8A882', label: '로퍼' },
      { color: '#C8B89A', label: '베이지 백' },
    ],
    memo: '스승의 날',
    weather: '⛅ 20°C',
  },
  '2026-05-16': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님 쇼츠' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '주말',
    weather: '☀️ 26°C',
  },
  '2026-05-19': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#FAFAFA', label: '블라우스' },
      { color: '#E8DCC8', label: '크림 팬츠' },
      { color: '#7A5A3A', label: '브라운 부츠' },
      { color: '#E8DCC8', label: '토트백' },
    ],
    memo: '브런치',
    weather: '⛅ 22°C',
  },
  '2026-05-20': {
    items: [
      { color: '#6A4A2A', label: '묶음' },
      { color: '#FAFAFA', label: '화이트 탑' },
      { color: '#C8B89A', label: '베이지 스커트' },
      { color: '#7A5A3A', label: '브라운 부츠' },
      { color: '#8A6A4A', label: '브라운 백' },
    ],
    memo: '사진 찍기',
    weather: '☀️ 23°C',
  },
  '2026-05-22': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '일상',
    weather: '☀️ 24°C',
  },
  '2026-05-23': {
    items: [
      { color: '#8A6A3A', label: '헤어' },
      { color: '#FAFAFA', label: '블라우스' },
      { color: '#1C1C1C', label: '블랙 팬츠' },
      { color: '#F0F0F0', label: '스니커즈' },
      { color: '#C8B89A', label: '숄더백' },
    ],
    memo: '저녁 약속',
    weather: '🌙 19°C',
  },
  '2026-05-26': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님 쇼츠' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '월요일',
    weather: '☁️ 18°C',
  },
  '2026-05-27': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#8A8A8A', label: '그레이 탑' },
      { color: '#7A7A7A', label: '그레이 팬츠' },
      { color: '#2A2A2A', label: '스니커즈' },
      { color: '#1C1C1C', label: '크로스백' },
    ],
    memo: '회사',
    weather: '☁️ 17°C',
  },
  '2026-05-30': {
    items: [
      { color: '#6A7A5A', label: '베레모' },
      { color: '#1C1C1C', label: '블랙 탑' },
      { color: '#6B8CAE', label: '데님 쇼츠' },
      { color: '#1C1C1C', label: '부츠' },
      { color: '#1C1C1C', label: '숄더백' },
    ],
    memo: '친구랑 카페 가는 날 ☕',
    weather: '⛅ 22°C',
  },
}

// ── 날짜 유틸 ────────────────────────────────────────────────────
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()]
}

interface CalendarCell {
  date: Date
  key: string
  isCurrentMonth: boolean
}

function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const cells: CalendarCell[] = []

  // 이전 달 날짜 채우기
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, key: toDateKey(d), isCurrentMonth: false })
  }

  // 이번 달 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    cells.push({ date, key: toDateKey(date), isCurrentMonth: true })
  }

  // 다음 달 날짜 채우기 (6행 맞춤)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    cells.push({ date, key: toDateKey(date), isCurrentMonth: false })
  }

  return cells
}

// ── 컴포넌트 ─────────────────────────────────────────────────────
export default function CalendarScreen() {
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth())
  const [selectedKey, setSelectedKey] = useState<string>(TODAY_STR)

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month])
  const selectedOutfit = MOCK_OUTFITS[selectedKey] ?? null

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.dayLabelRow}>
        {DAY_LABELS.map((label, i) => (
          <Text
            key={label}
            style={[styles.dayLabel, i === 0 && styles.dayLabelSun, i === 6 && styles.dayLabelSat]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* 캘린더 그리드 */}
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell) => {
              const outfit = MOCK_OUTFITS[cell.key]
              const isToday = cell.key === TODAY_STR
              const isSelected = cell.key === selectedKey

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[styles.cell, isSelected && !isToday && styles.cellSelected]}
                  onPress={() => setSelectedKey(cell.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dateCircle, isToday && styles.dateCircleToday]}>
                    <Text
                      style={[
                        styles.dateText,
                        !cell.isCurrentMonth && styles.dateTextMuted,
                        isToday && styles.dateTextToday,
                      ]}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </View>
                  {outfit && cell.isCurrentMonth && (
                    <Image source={BASE_AVATAR} style={styles.miniAvatar} resizeMode="contain" />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </View>

      {/* 선택된 날짜 상세 카드 */}
      {selectedOutfit && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>
              {month + 1}월 {new Date(selectedKey).getDate()}일 (
              {getDayLabel(new Date(selectedKey))})
            </Text>
            <Text style={styles.detailWeather}>{selectedOutfit.weather}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemRow}
          >
            {selectedOutfit.items.map((item, i) => (
              <View key={i} style={styles.itemThumb}>
                <View style={[styles.itemColor, { backgroundColor: item.color }]} />
              </View>
            ))}
          </ScrollView>

          {selectedOutfit.memo ? (
            <Text style={styles.detailMemo}>{selectedOutfit.memo}</Text>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  )
}

// ── 스타일 ───────────────────────────────────────────────────────
const CELL_HEIGHT = Math.floor((Dimensions.get('window').height * 0.46) / 6)

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  // 요일 헤더
  dayLabelRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    width: CELL_WIDTH,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dayLabelSun: { color: '#C0616B' },
  dayLabelSat: { color: '#6B8CAE' },

  // 그리드
  grid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cell: {
    width: CELL_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  cellSelected: {
    backgroundColor: colors.primary,
  },
  dateCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    backgroundColor: colors.text,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  dateTextMuted: {
    color: colors.border,
  },
  dateTextToday: {
    color: colors.white,
    fontWeight: '700',
  },
  miniAvatar: {
    width: CELL_WIDTH - 8,
    height: CELL_HEIGHT - 28,
    marginTop: 1,
  },

  // 상세 카드
  detailCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  detailWeather: {
    fontSize: 13,
    color: colors.textMuted,
  },
  itemRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  itemThumb: {
    width: 64,
    height: 64,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemColor: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  detailMemo: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
})
