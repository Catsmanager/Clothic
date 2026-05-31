import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  totalCount: number
}

export default function SleepingSummaryBanner({ totalCount }: Props) {
  return (
    <View style={styles.infoBanner}>
      <View style={styles.infoBannerLeft}>
        <View style={styles.boxIllustration}>
          <Text style={styles.boxIllustrationEmoji}>📦</Text>
          <Text style={styles.boxZzz}>zzz</Text>
        </View>
        <View style={styles.infoBannerText}>
          <Text style={styles.infoBannerTitle}>잠자는 옷이 많아요 😴</Text>
          <Text style={styles.infoBannerDesc}>
            다시 꺼내 입으면 새로운 코디를{'\n'}완성할 수 있어요.
          </Text>
        </View>
      </View>
      <View style={styles.infoBannerCount}>
        <Text style={styles.infoBannerCountNum}>{totalCount}</Text>
        <Text style={styles.infoBannerCountLabel}>개</Text>
        <Text style={styles.infoBannerCountSub}>전체 잠자는 옷</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  boxIllustration: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIllustrationEmoji: {
    fontSize: 24,
  },
  boxZzz: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoBannerDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  infoBannerCount: {
    alignItems: 'flex-end',
  },
  infoBannerCountNum: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  infoBannerCountLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -4,
  },
  infoBannerCountSub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
})
