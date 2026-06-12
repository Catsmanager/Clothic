import { useEffect, useMemo, useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import HomeHeader from '../../components/HomeHeader'
import DateWeatherBar from '../../components/DateWeatherBar'
import HomeMenuSheet from '../../components/HomeMenuSheet'
import AvatarCard from '../../components/AvatarCard'
import MoodMemoCard from '../../components/MoodMemoCard'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import { getTodayDateKey } from '../../lib/date'
import { isHomeCreateHintSeen, setHomeCreateHintSeen } from '../../lib/homeHint'
import { useOutfitStore } from '../../stores/outfitStore'

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false)
  const [showCreateHint, setShowCreateHint] = useState(false)
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)

  useEffect(() => {
    fetchOutfits()
  }, [fetchOutfits])

  useEffect(() => {
    let mounted = true

    async function restoreCreateHint() {
      const seen = await isHomeCreateHintSeen()
      if (mounted) setShowCreateHint(!seen)
    }

    restoreCreateHint()
    return () => {
      mounted = false
    }
  }, [])

  const todayOutfit = useMemo(
    () => outfits.find((outfit) => outfit.date === getTodayDateKey()) ?? null,
    [outfits]
  )

  async function dismissCreateHint() {
    setShowCreateHint(false)
    await setHomeCreateHintSeen()
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <HomeHeader onMenuPress={() => setMenuVisible(true)} />
      <DateWeatherBar />
      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <AvatarCard />
          {showCreateHint && (
            <View style={styles.createHint}>
              <View style={styles.createHintIcon}>
                <Feather name="plus" size={15} color={colors.white} />
              </View>
              <Text style={styles.createHintText}>아래 + 버튼으로 만들어요</Text>
              <TouchableOpacity
                style={styles.createHintClose}
                onPress={dismissCreateHint}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="코디 만들기 안내 닫기"
              >
                <Feather name="x" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
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
  createHint: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  createHintIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHintText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  createHintClose: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
