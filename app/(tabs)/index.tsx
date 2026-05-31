import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import HomeHeader from '../../components/HomeHeader'
import DateWeatherBar from '../../components/DateWeatherBar'
import AvatarCard from '../../components/AvatarCard'
import MoodMemoCard from '../../components/MoodMemoCard'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'

// mock 데이터 — 에셋/DB 연동 전 임시
const mockOutfit = {
  mood: 'happy' as const,
  memo: '친구랑 카페 가는 날 ☕',
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <HomeHeader />
      <DateWeatherBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AvatarCard
          onEdit={() => router.push('/(tabs)/create')}
          onCopy={() => {}}
          onDelete={() => {}}
        />
        <MoodMemoCard mood={mockOutfit.mood} memo={mockOutfit.memo} />
      </ScrollView>

      <View style={styles.footer}>
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
