import { StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  totalCount: number
}

export default function SleepingSummaryBanner({ totalCount }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="wardrobe-outline" size={24} color={colors.text} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>잠자는 옷 {totalCount}벌</Text>
          <Text style={styles.desc}>현재 계절 옷 중 20일 이상 입지 않은 옷이에요.</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
})
