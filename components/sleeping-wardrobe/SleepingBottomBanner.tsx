import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

export default function SleepingBottomBanner() {
  return (
    <View style={styles.bottomBanner}>
      <View style={styles.bottomBannerLeft}>
        <Text style={styles.bottomBannerLeaf}>🌱</Text>
        <View>
          <Text style={styles.bottomBannerTitle}>옷장을 가볍게, 스타일은 더 풍성하게 🌱</Text>
          <Text style={styles.bottomBannerDesc}>잠자는 옷을 다시 활용해보세요!</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.recommendButton}>
        <Text style={styles.recommendButtonText}>코디 추천 받기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  bottomBannerLeaf: {
    fontSize: 24,
  },
  bottomBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  bottomBannerDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recommendButton: {
    backgroundColor: colors.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexShrink: 0,
  },
  recommendButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
})
