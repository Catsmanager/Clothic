import { useEffect, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import HomeHeader from '../../components/HomeHeader'
import DateWeatherBar from '../../components/DateWeatherBar'
import AvatarCard from '../../components/AvatarCard'
import MoodMemoCard from '../../components/MoodMemoCard'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import { getTodayDateKey } from '../../lib/date'
import { useOutfitStore } from '../../stores/outfitStore'

export default function HomeScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)

  useEffect(() => {
    fetchOutfits()
  }, [fetchOutfits])

  const todayOutfit = useMemo(
    () => outfits.find((outfit) => outfit.date === getTodayDateKey()) ?? null,
    [outfits]
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <HomeHeader />
      <DateWeatherBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AvatarCard />
        <MoodMemoCard mood={todayOutfit?.mood ?? null} memo={todayOutfit?.memo ?? null} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.savedButton}
          onPress={() => router.push('/outfits')}
          activeOpacity={0.85}
        >
          <Text style={styles.savedText}>저장한 코디 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>＋ 새 코디 만들기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.secondary,
    gap: spacing.sm,
  },
  savedButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: colors.text,
    borderRadius: radius.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
