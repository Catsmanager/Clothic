import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'
import { formatKoreanMonthDayWithWeekday } from '../../lib/date'
import { WEATHER_LABELS, type Outfit } from '../../stores/outfitStore'

interface Props {
  dateKey: string
  items: CatalogItem[]
  outfit: Outfit
}

export default function SelectedOutfitCard({ dateKey, items, outfit }: Props) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailDate}>{formatKoreanMonthDayWithWeekday(dateKey)}</Text>
        <Text style={styles.detailWeather}>
          {outfit.weather ? WEATHER_LABELS[outfit.weather] : '-'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemRow}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.itemThumb}>
            <View style={[styles.itemColor, { backgroundColor: item.color }]} />
          </View>
        ))}
      </ScrollView>

      {outfit.memo ? <Text style={styles.detailMemo}>{outfit.memo}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
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
