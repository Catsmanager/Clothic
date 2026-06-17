import { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import HomeHeader from '../../components/HomeHeader'
import DateWeatherBar from '../../components/DateWeatherBar'
import HomeMenuSheet from '../../components/HomeMenuSheet'
import AvatarCard from '../../components/AvatarCard'
import MoodMemoCard from '../../components/MoodMemoCard'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import { getTodayDateKey } from '../../lib/date'
import { useOutfitStore } from '../../stores/outfitStore'
import { buildCatalogItems, findCatalogItemById, useItemStore } from '../../stores/itemStore'

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const handledSavedFeedbackId = useRef<string | null>(null)
  const { savedOutfit } = useLocalSearchParams<{ savedOutfit?: string | string[] }>()
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const userItems = useItemStore((s) => s.items)
  const fetchItems = useItemStore((s) => s.fetchItems)

  useEffect(() => {
    fetchOutfits()
    fetchItems()
  }, [fetchItems, fetchOutfits])

  useEffect(() => {
    const feedbackId = Array.isArray(savedOutfit) ? savedOutfit[0] : savedOutfit
    if (feedbackId == null || handledSavedFeedbackId.current === feedbackId) return

    handledSavedFeedbackId.current = feedbackId
    setShowSavedFeedback(true)

    const timer = setTimeout(() => {
      setShowSavedFeedback(false)
    }, 2800)

    return () => clearTimeout(timer)
  }, [savedOutfit])

  const todayOutfit = useMemo(
    () => outfits.find((outfit) => outfit.date === getTodayDateKey()) ?? null,
    [outfits]
  )

  // 오늘 코디가 있으면 착용 아이템을 카탈로그로 풀어 아바타에 입힌다. 없으면 null(빈 상태).
  const todayItems = useMemo(() => {
    if (todayOutfit == null) return null
    const catalog = buildCatalogItems(userItems)
    return todayOutfit.itemIds
      .map((id) => findCatalogItemById(catalog, id))
      .filter((item): item is NonNullable<typeof item> => item != null)
  }, [todayOutfit, userItems])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <HomeHeader onMenuPress={() => setMenuVisible(true)} />
      <DateWeatherBar />
      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <AvatarCard items={todayItems} savedFeedback={showSavedFeedback} />
        </View>
        <MoodMemoCard mood={todayOutfit?.mood ?? null} memo={todayOutfit?.memo ?? null} />
      </View>
      <HomeMenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  avatarWrap: {
    flex: 1,
  },
})
