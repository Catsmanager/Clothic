import { useEffect, useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import { getItemById } from '../../constants/items'
import OutfitAvatar from '../../components/OutfitAvatar'
import { WEATHER_LABELS, useOutfitStore } from '../../stores/outfitStore'

const SCREEN_WIDTH = Dimensions.get('window').width
const CELL_WIDTH = Math.floor(SCREEN_WIDTH / 7)

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = new Date()
const TODAY_STR = toDateKey(TODAY)

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
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth())
  const [selectedKey, setSelectedKey] = useState<string>(TODAY_STR)

  useEffect(() => {
    fetchOutfits()
  }, [fetchOutfits])

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month])
  const outfitsByDate = useMemo(
    () => new Map(outfits.map((outfit) => [outfit.date, outfit])),
    [outfits]
  )
  const selectedOutfit = outfitsByDate.get(selectedKey) ?? null
  const selectedItems = useMemo(
    () => selectedOutfit?.itemIds.map((id) => getItemById(id)).filter((item) => item != null) ?? [],
    [selectedOutfit]
  )

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
              const outfit = outfitsByDate.get(cell.key)
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
                  {outfit && cell.isCurrentMonth && <OutfitAvatar style={styles.miniAvatar} />}
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
            <Text style={styles.detailWeather}>
              {selectedOutfit.weather ? WEATHER_LABELS[selectedOutfit.weather] : '-'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemRow}
          >
            {selectedItems.map((item) => (
              <View key={item.id} style={styles.itemThumb}>
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
