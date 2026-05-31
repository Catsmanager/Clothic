import { useRef, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'
import DonutChart from '../components/DonutChart'

const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')
const ROOM_BG = require('../assets/avatar/background/room_01.png')
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
// 슬라이드 0: 방 배경 위에 아바타
function Illust0() {
  return (
    <ImageBackground source={ROOM_BG} style={illust.welcomeBox} imageStyle={illust.welcomeBgImg}>
      <Image source={BASE_AVATAR} style={illust.welcomeAvatar} resizeMode="contain" />
    </ImageBackground>
  )
}

// 슬라이드 1: 코디 기록 카드 (날짜/날씨 + 아바타 + 액션 버튼)
function Illust1() {
  const ACTIONS: { label: string; icon: ReactElement }[] = [
    { label: '사진', icon: <Feather name="image" size={22} color={colors.text} /> },
    {
      label: '아바타',
      icon: <MaterialCommunityIcons name="hanger" size={22} color={colors.text} />,
    },
    { label: '직접 선택', icon: <Feather name="plus" size={22} color={colors.text} /> },
  ]
  return (
    <View style={illust.card}>
      <View style={illust.cardTopRow}>
        <Text style={illust.cardDateText}>2026.05.30 (금)</Text>
        <Text style={illust.cardWeatherText}>⛅ 22°C</Text>
      </View>
      <ImageBackground source={ROOM_BG} style={illust.cardImage} imageStyle={illust.cardImageBg}>
        <Image source={BASE_AVATAR} style={illust.cardAvatar} resizeMode="contain" />
      </ImageBackground>
      <View style={illust.cardBtnRow}>
        {ACTIONS.map((a) => (
          <View key={a.label} style={illust.cardBtn}>
            <View style={illust.cardBtnIcon}>{a.icon}</View>
            <Text style={illust.cardBtnText}>{a.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// 슬라이드 2: 날씨·기분·메모 입력 카드
function Illust2() {
  return (
    <View style={illust.card}>
      <Text style={illust.fieldLabel}>날씨</Text>
      <Text style={illust.weatherValue}>⛅ 22°C</Text>

      <View style={illust.divider} />

      <Text style={illust.fieldLabel}>오늘 기분</Text>
      <View style={illust.inputBox}>
        <Text style={illust.inputText}>😊 좋음</Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </View>

      <Text style={[illust.fieldLabel, { marginTop: spacing.md }]}>오늘 한 줄</Text>
      <View style={illust.inputBox}>
        <Text style={illust.inputText}>친구랑 카페 가는 날 ☕</Text>
      </View>
    </View>
  )
}

// 슬라이드 3: 옷장 + 잠자는 옷장 배너
function Illust3() {
  return (
    <View style={{ gap: spacing.md, width: '100%' }}>
      <View style={illust.closetBox}>
        <View style={illust.closetRail} />
        <Text style={illust.closetHang}>🧥　👗　🧥　👚　👜</Text>
        <View style={illust.closetShelf}>
          <Text style={illust.closetShelfItems}>👞　👟　👜</Text>
        </View>
      </View>
      <View style={illust.banner}>
        <View style={illust.bannerIcon}>
          <Text style={{ fontSize: 22 }}>🧺</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={illust.bannerTitle}>잠자는 옷이 많아요 😢</Text>
          <Text style={illust.bannerSub}>
            다시 꺼내 입으면{'\n'}새로운 코디를 완성할 수 있어요.
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </View>
  )
}

// 슬라이드 4: 월간 리포트 카드
const COLOR_STATS: { name: string; pct: string; color: string }[] = [
  { name: 'Black', pct: '42%', color: '#1C1C1C' },
  { name: 'Gray', pct: '21%', color: '#8A8A8A' },
  { name: 'White', pct: '15%', color: '#E8E8E8' },
  { name: 'Beige', pct: '10%', color: '#D4C4A8' },
  { name: 'Pink', pct: '12%', color: '#E8C4C4' },
]

const TOP_ITEMS: { emoji: string; name: string; count: string }[] = [
  { emoji: '👢', name: '블랙 롱 부츠', count: '12회' },
  { emoji: '🧥', name: '네이비 후드', count: '10회' },
  { emoji: '👚', name: '슬리브리스', count: '8회' },
]

function Illust4() {
  return (
    <View style={illust.card}>
      <View style={illust.reportHead}>
        <Text style={illust.reportTitle}>월간 리포트</Text>
        <View style={illust.monthNav}>
          <Feather name="chevron-left" size={16} color={colors.textMuted} />
          <Text style={illust.monthText}>2026년 5월</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </View>

      <View style={illust.divider} />

      <Text style={illust.fieldLabel}>총 코디 수</Text>
      <Text style={illust.bigStat}>
        24 <Text style={illust.bigStatUnit}>회</Text>
      </Text>

      <Text style={[illust.fieldLabel, { marginTop: spacing.sm }]}>가장 많이 입은 색상</Text>
      <View style={illust.colorRow}>
        <DonutChart
          size={88}
          strokeWidth={20}
          segments={COLOR_STATS.map((c) => ({ value: parseInt(c.pct, 10), color: c.color }))}
        />
        <View style={illust.legend}>
          {COLOR_STATS.map((c) => (
            <View key={c.name} style={illust.legendRow}>
              <View style={[illust.legendDot, { backgroundColor: c.color }]} />
              <Text style={illust.legendName}>{c.name}</Text>
              <Text style={illust.legendPct}>{c.pct}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={illust.divider} />

      <Text style={illust.fieldLabel}>가장 많이 입은 아이템 TOP 3</Text>
      <View style={{ marginTop: spacing.xs, gap: spacing.xs }}>
        {TOP_ITEMS.map((it) => (
          <View key={it.name} style={illust.topRow}>
            <Text style={illust.topEmoji}>{it.emoji}</Text>
            <Text style={illust.topName}>{it.name}</Text>
            <Text style={illust.topCount}>{it.count}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// 슬라이드 5: 컨페티 + 아바타
const CONFETTI: { emoji: string; top: number; left: number; size: number }[] = [
  { emoji: '✨', top: 6, left: 20, size: 18 },
  { emoji: '🌸', top: 0, left: 70, size: 16 },
  { emoji: '💛', top: 24, left: 88, size: 16 },
  { emoji: '🔶', top: 60, left: 8, size: 14 },
  { emoji: '💫', top: 90, left: 90, size: 16 },
  { emoji: '🌼', top: 120, left: 4, size: 14 },
  { emoji: '✦', top: 40, left: 50, size: 14 },
]

function Illust5() {
  return (
    <View style={illust.finalBox}>
      {CONFETTI.map((c, i) => (
        <Text
          key={i}
          style={{ position: 'absolute', top: c.top, left: `${c.left}%`, fontSize: c.size }}
        >
          {c.emoji}
        </Text>
      ))}
      <Image source={BASE_AVATAR} style={illust.finalAvatar} resizeMode="contain" />
    </View>
  )
}

const ILLUSTS = [Illust0, Illust1, Illust2, Illust3, Illust4, Illust5]

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const listRef = useRef<FlatList<Slide>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 스와이프 시 오프셋으로 현재 인덱스를 동기화한다(웹에서도 안정적).
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SW)
    setCurrentIndex((prev) => (prev === idx ? prev : idx))
  }, [])

  // 버튼 이동: 인덱스를 직접 계산해 scrollToOffset으로 이동한다.
  // (scrollToIndex는 getItemLayout 없이 web에서 실패할 수 있어 오프셋 사용)
  function goNext() {
    const next = Math.min(currentIndex + 1, TOTAL_SLIDES - 1)
    if (next === currentIndex) return
    setCurrentIndex(next)
    listRef.current?.scrollToOffset({ offset: next * SW, animated: true })
  }

  async function goStart() {
    await completeOnboarding()
    // 온보딩 후에는 아직 미로그인 상태이므로 로그인 화면으로 보낸다.
    // (이미 로그인돼 있다면 인증 가드가 곧바로 /(tabs)로 보정한다)
    router.replace('/login')
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === TOTAL_SLIDES - 1

  const Dots = (
    <View style={styles.dots}>
      {SLIDES.map((_, i) => (
        <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
      ))}
    </View>
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: SW, offset: SW * index, index })}
        renderItem={({ item, index }) => {
          const IllustComponent = ILLUSTS[index]
          return <SlideView slide={item} IllustComponent={IllustComponent} />
        }}
      />

      {/* 하단 영역 */}
      <View style={styles.bottom}>
        {isFirst ? (
          // welcome: 시작하기 버튼(→ 다음 장) → 도트
          // 마지막 슬라이드의 '시작하기'에서만 온보딩을 완료한다.
          <>
            <TouchableOpacity style={styles.startBtn} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.startBtnText}>시작하기</Text>
            </TouchableOpacity>
            {Dots}
          </>
        ) : isLast ? (
          // final: 도트 → 시작하기 버튼
          <>
            {Dots}
            <TouchableOpacity style={styles.startBtn} onPress={goStart} activeOpacity={0.85}>
              <Text style={styles.startBtnText}>시작하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          // feature: 도트(좌) + 화살표(우)
          <View style={styles.featureBottom}>
            {Dots}
            <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
              <Feather name="arrow-right" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

// ── 슬라이드 뷰 ──────────────────────────────────────────────
interface SlideViewProps {
  slide: Slide
  IllustComponent: () => ReactElement
}

function SlideView({ slide, IllustComponent }: SlideViewProps) {
  const isFinal = slide.type === 'final'

  // final: 일러스트 → 텍스트(중앙)
  if (isFinal) {
    return (
      <View style={styles.slide}>
        <View style={styles.illustArea}>
          <IllustComponent />
        </View>
        <View style={styles.textBlockFinal}>
          <Text style={styles.titleCenter}>{slide.title}</Text>
          <Text style={styles.subtitleCenter}>{slide.subtitle}</Text>
        </View>
      </View>
    )
  }

  // welcome / feature: 텍스트(상단) → 일러스트
  return (
    <View style={styles.slide}>
      {slide.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{slide.badge}</Text>
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
      <View style={styles.illustArea}>
        <IllustComponent />
      </View>
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
  textBlockFinal: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  titleCenter: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  subtitleCenter: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  illustArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 하단
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  featureBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
})

// ── 일러스트 스타일 ───────────────────────────────────────────
const illust = StyleSheet.create({
  // 슬라이드 0
  welcomeBox: {
    width: SW - spacing.xl * 2,
    height: SH * 0.4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  welcomeBgImg: {
    borderRadius: radius.lg,
    resizeMode: 'cover',
  },
  welcomeAvatar: {
    width: '46%',
    height: '78%',
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  cardWeatherText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardImage: {
    height: 150,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardImageBg: {
    borderRadius: radius.sm,
    resizeMode: 'cover',
  },
  cardAvatar: {
    width: 70,
    height: 130,
  },
  cardBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  cardBtnIcon: {
    height: 24,
    justifyContent: 'center',
  },
  cardBtnText: {
    fontSize: 12,
    color: colors.text,
  },

  // 슬라이드 2 (공용 필드 스타일)
  fieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  inputText: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // 슬라이드 3
  closetBox: {
    width: '100%',
    height: 150,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  closetRail: {
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  closetHang: {
    fontSize: 30,
    textAlign: 'center',
  },
  closetShelf: {
    borderTopWidth: 1,
    borderTopColor: colors.accent,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  closetShelfItems: {
    fontSize: 22,
    textAlign: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },

  // 슬라이드 4
  reportHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthText: {
    fontSize: 13,
    color: colors.text,
  },
  bigStat: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  bigStatUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendName: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  legendPct: {
    fontSize: 12,
    color: colors.textMuted,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topEmoji: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  topName: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  topCount: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // 슬라이드 5
  finalBox: {
    width: SW - spacing.xl * 2,
    height: SH * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalAvatar: {
    width: '52%',
    height: '100%',
  },
})
