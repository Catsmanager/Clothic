import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { formatDateKey, WEEKDAY_LABELS } from '../../lib/date'
import { getWeekDates } from '../../lib/weeklyStats'
import StatsCard from './StatsCard'

interface Props {
  totalOutfits: number
  diffFromLastWeek: number
  weekStart: Date
  recordedDates: string[]
}

export default function WeeklyOutfitsCard({
  totalOutfits,
  diffFromLastWeek,
  weekStart,
  recordedDates,
}: Props) {
  const recordedSet = new Set(recordedDates)
  const diffText =
    diffFromLastWeek === 0
      ? '지난주와 동일'
      : `지난주보다 ${Math.abs(diffFromLastWeek)}회 ${diffFromLastWeek > 0 ? '↑' : '↓'}`
  const diffStyle =
    diffFromLastWeek === 0
      ? styles.diffSame
      : diffFromLastWeek > 0
        ? styles.diffUp
        : styles.diffDown

  return (
    <StatsCard label="이번 주 코디">
      <View style={styles.totalRow}>
        <Text style={styles.total}>{totalOutfits}</Text>
        <Text style={styles.unit}> 회</Text>
        <Text style={[styles.diff, diffStyle]}>{diffText}</Text>
      </View>
      <View style={styles.days}>
        {getWeekDates(weekStart).map((date) => {
          const recorded = recordedSet.has(formatDateKey(date))
          return (
            <View key={formatDateKey(date)} style={styles.day}>
              <Text style={styles.dayLabel}>{WEEKDAY_LABELS[date.getDay()]}</Text>
              <View style={[styles.dayMark, recorded && styles.dayMarkRecorded]}>
                {recorded && <Feather name="check" size={12} color={colors.white} />}
              </View>
            </View>
          )
        })}
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  totalRow: { flexDirection: 'row', alignItems: 'flex-end' },
  total: { fontSize: 40, lineHeight: 48, fontWeight: '700', color: colors.text },
  unit: { paddingBottom: 7, fontSize: 18, color: colors.text },
  diff: { flex: 1, textAlign: 'right', paddingBottom: 8, fontSize: 13, fontWeight: '500' },
  diffSame: { color: colors.textMuted },
  diffUp: { color: '#3DB87A' },
  diffDown: { color: colors.danger },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  day: { alignItems: 'center', gap: spacing.xs },
  dayLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  dayMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DED8D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMarkRecorded: { backgroundColor: '#D2B294', borderColor: '#D2B294' },
})
