import { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  type ViewToken,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'

const ONBOARDING_KEY = 'clothic_onboarding_done'

const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')
const { width: SW, height: SH } = Dimensions.get('window')

const TOTAL_SLIDES = 6

// ── 슬라이드 데이터 ──────────────────────────────────────────
type SlideType = 'welcome' | 'feature' | 'final'

interface Slide {
  id: string
  type: SlideType
  badge?: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    id: 's0',
    type: 'welcome',
    title: '나의 매일을\n기록하는 코디 다이어리',
    subtitle: '오늘의 코디와 기분, 날씨까지\n한 번에 기록해보세요.',
  },
  {
    id: 's1',
    type: 'feature',
    badge: '01',
    title: '쉽고 빠르게\n코디를 기록해요',
    subtitle: '사진 또는 아바타로 간편하게\n오늘의 코디를 저장할 수 있어요.',
  },
  {
    id: 's2',
    type: 'feature',
    badge: '02',
    title: '날씨와 기분,\n한 줄 메모까지',
    subtitle: '그날의 날씨, 기분, 한 줄 메모로\n나만의 하루를 기록해보세요.',
  },
  {
    id: 's3',
    type: 'feature',
    badge: '03',
    title: '옷장을 관리하고\n활용해요',
    subtitle: "내 옷을 등록하고 '잠자는 옷장'에서\n안 입는 옷을 쉽게 확인해보세요.",
  },
  {
    id: 's4',
    type: 'feature',
    badge: '04',
    title: '통계와 리포트로\n나를 알아가요',
    subtitle: '월별 코디 통계와 자주 입는 아이템을\n확인하며 나만의 스타일을 찾아보세요.',
  },
  {
    id: 's5',
    type: 'final',
    title: '오늘부터\n나만의 스타일 여정을\n시작해볼까요? ✨',
    subtitle: '매일의 기록이 쌓여\n나만의 스타일이 완성돼요.',
  },
]

// ── 슬라이드별 일러스트 ──────────────────────────────────────
function Illust0() {
  return (
    <View style={illust.welcomeBox}>
      <Image source={BASE_AVATAR} style={illust.welcomeAvatar} resizeMode="contain" />
      <View style={illust.mirrorBox}>
        <Text style={illust.mirrorText}>🪞</Text>
      </View>
    </View>
  )
}

function Illust1() {
  return (
    <View style={illust.card}>
      <Text style={illust.cardDateText}>2026.05.30 (금) ⛅ 22°C</Text>
      <View style={illust.cardAvatarRow}>
        <Image source={BASE_AVATAR} style={illust.cardAvatar} resizeMode="contain" />
      </View>
      <View style={illust.cardBtnRow}>
        {['🖼️\n사진', '👗\n아바타', '＋\n직접 선택'].map((label) => (
          <View key={label} style={illust.cardBtn}>
            <Text style={illust.cardBtnText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function Illust2() {
  return (
    <View style={illust.card}>
      <View style={illust.formRow}>
        <Text style={illust.formLabel}>날씨</Text>
        <Text style={illust.formValue}>⛅ 22°C</Text>
      </View>
      <View style={illust.divider} />
      <View style={illust.formRow}>
        <Text style={illust.formLabel}>오늘 기분</Text>
        <Text style={illust.formValue}>😊 좋음 ∨</Text>
      </View>
      <View style={illust.divider} />
      <Text style={illust.formLabel}>오늘 한 줄</Text>
      <Text style={[illust.formValue, { marginTop: 4 }]}>친구랑 카페 가는 날 ☕</Text>
    </View>
  )
}

function Illust3() {
  return (
    <View style={{ gap: spacing.sm, width: '100%' }}>
      <View style={illust.closetBox}>
        <Text style={illust.closetEmoji}>👔 🧥 👖 👟 👜</Text>
        <Text style={illust.closetSub}>나의 옷장</Text>
      </View>
      <View style={[illust.card, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}>
        <Text style={{ fontSize: 28 }}>🥺</Text>
        <View style={{ flex: 1 }}>
          <Text style={illust.formLabel}>잠자는 옷이 많아요</Text>
          <Text style={[illust.formValue, { fontSize: 11 }]}>
            다시 꺼내 입으면{'\n'}새로운 코디를 완성할 수 있어요.
          </Text>
        </View>
        <Text style={{ color: colors.textMuted }}>›</Text>
      </View>
    </View>
  )
}

function Illust4() {
  return (
    <View style={illust.card}>
      <Text style={[illust.formLabel, { marginBottom: 4 }]}>월간 리포트</Text>
      <Text style={illust.cardDateText}>{'<  2026년 5월  >'}</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginVertical: 4 }}>
        24 <Text style={{ fontSize: 14, fontWeight: '400' }}>회</Text>
      </Text>
      <Text style={illust.formLabel}>가장 많이 입은 색상</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
        {[
          ['#1C1C1C', '42%'],
          ['#8A8A8A', '21%'],
          ['#E8E8E8', '15%'],
          ['#D4C4A8', '10%'],
        ].map(([c, p]) => (
          <View key={c} style={{ alignItems: 'center', gap: 2 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c }} />
            <Text style={{ fontSize: 9, color: colors.textMuted }}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 8, gap: 4 }}>
        {[
          ['블랙 롱 부츠', '12회'],
          ['네이비 후드', '10회'],
          ['슬리브리스', '8회'],
        ].map(([name, cnt]) => (
          <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: colors.text }}>• {name}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{cnt}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function Illust5() {
  return (
    <View style={illust.finalBox}>
      <Image source={BASE_AVATAR} style={illust.finalAvatar} resizeMode="contain" />
    </View>
  )
}

const ILLUSTS = [Illust0, Illust1, Illust2, Illust3, Illust4, Illust5]

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function OnboardingScreen() {
  const listRef = useRef<FlatList<Slide>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index)
      }
    },
    []
  )

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 }

  function goNext() {
    if (currentIndex < TOTAL_SLIDES - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
    }
  }

  async function goStart() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)')
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === TOTAL_SLIDES - 1
  const showStartBtn = isFirst || isLast

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => {
          const IllustComponent = ILLUSTS[index]
          return <SlideView slide={item} IllustComponent={IllustComponent} />
        }}
      />

      {/* 하단 영역: 도트 + 버튼 */}
      <View style={styles.bottom}>
        {/* 페이지 도트 */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        {/* 버튼 */}
        {showStartBtn ? (
          <TouchableOpacity style={styles.startBtn} onPress={goStart} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>시작하기</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
            <Feather name="arrow-right" size={22} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

// ── 슬라이드 뷰 ──────────────────────────────────────────────
interface SlideViewProps {
  slide: Slide
  IllustComponent: () => React.ReactElement
}

function SlideView({ slide, IllustComponent }: SlideViewProps) {
  const isFeature = slide.type === 'feature'
  const isFinal = slide.type === 'final'

  return (
    <View style={styles.slide}>
      {/* 배지 */}
      {slide.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{slide.badge}</Text>
        </View>
      )}

      {/* 텍스트 (feature: 상단 / welcome,final: 하단) */}
      {isFeature && (
        <View style={styles.textBlock}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>
      )}

      {/* 일러스트 */}
      <View style={[styles.illustArea, isFinal && styles.illustAreaFinal]}>
        <IllustComponent />
      </View>

      {/* welcome / final 텍스트는 일러스트 아래 */}
      {!isFeature && (
        <View style={[styles.textBlock, styles.textBlockCenter]}>
          <Text style={[styles.title, isFinal && styles.titleCenter]}>{slide.title}</Text>
          <Text style={[styles.subtitle, isFinal && styles.subtitleCenter]}>{slide.subtitle}</Text>
        </View>
      )}
    </View>
  )
}

// ── 스타일 ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  slide: {
    width: SW,
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  textBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  textBlockCenter: {
    alignItems: 'flex-start',
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  titleCenter: {
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  subtitleCenter: {
    textAlign: 'left',
  },
  illustArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustAreaFinal: {
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
  },

  // 하단
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.text,
  },
  startBtn: {
    backgroundColor: colors.text,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
})

// ── 일러스트 스타일 ───────────────────────────────────────────
const illust = StyleSheet.create({
  // 슬라이드 0
  welcomeBox: {
    width: SW - spacing.xl * 2,
    height: SH * 0.38,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  welcomeAvatar: {
    width: '50%',
    height: '90%',
  },
  mirrorBox: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.md,
  },
  mirrorText: {
    fontSize: 40,
  },

  // 슬라이드 1
  card: {
    width: SW - spacing.xl * 2,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardDateText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardAvatarRow: {
    alignItems: 'center',
    height: 100,
  },
  cardAvatar: {
    width: 70,
    height: 100,
  },
  cardBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cardBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cardBtnText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },

  // 슬라이드 2
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  formLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  formValue: {
    fontSize: 13,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // 슬라이드 3
  closetBox: {
    width: SW - spacing.xl * 2,
    height: 120,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  closetEmoji: {
    fontSize: 28,
    letterSpacing: 4,
  },
  closetSub: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // 슬라이드 5
  finalBox: {
    width: SW - spacing.xl * 2,
    height: SH * 0.32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalAvatar: {
    width: '55%',
    height: '100%',
  },
})
