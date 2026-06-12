import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import StatsCard from './StatsCard'

interface Props {
  diffFromLastMonth: number
  totalOutfits: number
}

export default function TotalOutfitsCard({ diffFromLastMonth, totalOutfits }: Props) {
  const diffStyle =
    diffFromLastMonth === 0 ? styles.diffSame : diffFromLastMonth > 0 ? styles.diffUp : styles.diffDown
  const diffText =
    diffFromLastMonth === 0
      ? '지난 달과 동일'
      : `지난 달보다 ${Math.abs(diffFromLastMonth)}회 ${diffFromLastMonth > 0 ? '↑' : '↓'}`

  return (
    <StatsCard label="총 코디 수">
      <View style={styles.totalRow}>
        <Text style={styles.totalCount}>{totalOutfits}</Text>
        <Text style={styles.totalUnit}> 회</Text>
        <View style={styles.spacer} />
        <Text style={[styles.diff, diffStyle]}>{diffText}</Text>
      </View>
    </StatsCard>
  )
}

const styles = StyleSheet.create({
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 48,
  },
  totalUnit: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '400',
    paddingBottom: 6,
  },
  spacer: {
    flex: 1,
  },
  diff: {
    fontSize: 13,
    fontWeight: '500',
    paddingBottom: 6,
  },
  diffSame: {
    color: colors.textMuted,
  },
  diffUp: {
    color: '#3DB87A',
  },
  diffDown: {
    color: colors.danger,
  },
})
