import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import OutfitAvatar from '../OutfitAvatar'
import type { CatalogItem } from '../../constants/items'
import type { CalendarCell } from '../../lib/calendar'
import { WEEKDAY_LABELS } from '../../lib/date'
import type { Outfit } from '../../stores/outfitStore'

interface Props {
  cells: CalendarCell[]
  catalogItems: CatalogItem[]
  outfitsByDate: Map<string, Outfit>
  selectedKey: string
  todayKey: string
  onSelectDate: (dateKey: string) => void
}

export default function CalendarGrid({
  cells,
  catalogItems,
  outfitsByDate,
  selectedKey,
  todayKey,
  onSelectDate,
}: Props) {
  const { width } = useWindowDimensions()
  const cellWidth = Math.floor(width / 7)

  return (
    <>
      <View style={styles.dayLabelRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={label}
            accessibilityRole="text"
            style={[
              styles.dayLabel,
              { width: cellWidth },
              index === 0 && styles.dayLabelSun,
              index === 6 && styles.dayLabelSat,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {cells.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell) => {
              const outfit = outfitsByDate.get(cell.key)
              const outfitItems =
                outfit?.itemIds
                  .map((id) => catalogItems.find((item) => item.id === id))
                  .filter((item): item is CatalogItem => item != null) ?? []
              const isToday = cell.key === todayKey
              const isSelected = cell.key === selectedKey

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[
                    styles.cell,
                    { width: cellWidth },
                    isSelected && !isToday && styles.cellSelected,
                  ]}
                  onPress={() => onSelectDate(cell.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일${
                    outfit ? ', 저장한 코디 있음' : ''
                  }${isToday ? ', 오늘' : ''}`}
                  accessibilityState={{ selected: isSelected }}
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
                    <OutfitAvatar items={outfitItems} style={styles.miniAvatar} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  dayLabelRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    textAlign: 'center',
    paddingVertical: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dayLabelSun: { color: '#C0616B' },
  dayLabelSat: { color: '#6B8CAE' },
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
  // 아바타(원본 1:2 portrait)를 셀의 남은 세로 공간에 맞춰 채운다.
  // 박스를 portrait 비율로 두어 contain 렌더 시 아바타가 작게 보이지 않도록 한다.
  miniAvatar: {
    flex: 1,
    aspectRatio: 887 / 1774,
    marginTop: 2,
    marginBottom: 4,
    alignSelf: 'center',
  },
})
