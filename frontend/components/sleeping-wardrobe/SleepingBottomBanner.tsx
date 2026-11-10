import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import type { SleepingItem } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  suggestedItem?: Pick<SleepingItem, 'id' | 'name'>
}

export default function SleepingBottomBanner({ suggestedItem }: Props) {
  function startSuggestedOutfit() {
    if (!suggestedItem) {
      router.push('/(tabs)/create')
      return
    }

    router.push({
      pathname: '/(tabs)/create',
      params: {
        selectedItemId: suggestedItem.id,
        selectionToken: Date.now().toString(),
      },
    })
  }

  return (
    <View style={styles.bottomBanner}>
      <View style={styles.bottomBannerLeft}>
        <View style={styles.iconBox}>
          <Feather name="refresh-cw" size={17} color={colors.text} />
        </View>
        <View>
          <Text style={styles.bottomBannerTitle}>잠자는 옷으로 새 코디 만들기</Text>
          <Text style={styles.bottomBannerDesc} numberOfLines={1}>
            {suggestedItem
              ? `${suggestedItem.name}을 입힌 상태로 시작해요.`
              : '아이템을 골라 바로 조합해보세요.'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.recommendButton}
        onPress={startSuggestedOutfit}
        accessibilityRole="button"
        accessibilityLabel={
          suggestedItem ? `${suggestedItem.name}으로 새 코디 시작하기` : '새 코디 시작하기'
        }
      >
        <Text style={styles.recommendButtonText}>시작</Text>
        <Feather name="arrow-right" size={14} color={colors.white} />
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
    padding: spacing.sm,
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.text,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexShrink: 0,
  },
  recommendButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
})
