import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import OutfitAvatar from '../OutfitAvatar'
import type { CalendarCell } from '../../lib/calendar'
import { WEEKDAY_LABELS } from '../../lib/date'
import type { Outfit } from '../../stores/outfitStore'

const SCREEN_WIDTH = Dimensions.get('window').width
const CELL_WIDTH = Math.floor(SCREEN_WIDTH / 7)
const CELL_HEIGHT = Math.floor((Dimensions.get('window').height * 0.46) / 6)

interface Props {
  cells: CalendarCell[]
  outfitsByDate: Map<string, Outfit>
  selectedKey: string
  todayKey: string
  onSelectDate: (dateKey: string) => void
}

export default function CalendarGrid({
  cells,
  outfitsByDate,
  selectedKey,
  todayKey,
  onSelectDate,
}: Props) {
  return (
    <>
      <View style={styles.dayLabelRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={label}
            style={[
              styles.dayLabel,
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
              const isToday = cell.key === todayKey
              const isSelected = cell.key === selectedKey

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[styles.cell, isSelected && !isToday && styles.cellSelected]}
                  onPress={() => onSelectDate(cell.key)}
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
    width: CELL_WIDTH,
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
})
