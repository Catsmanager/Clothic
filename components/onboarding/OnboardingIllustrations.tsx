import { Image, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import DonutChart from '../DonutChart'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { ONBOARDING_SCREEN_HEIGHT, ONBOARDING_SCREEN_WIDTH } from './layout'

const WELCOME_IMAGE = require('../../assets/onboarding/onboarding_01_welcome.png')
const CAPTURE_IMAGE = require('../../assets/onboarding/onboarding_02_capture.png')
const WARDROBE_IMAGE = require('../../assets/wardrobe.png')
const FINAL_IMAGE = require('../../assets/onboarding/onboarding_06_start.png')

const colorStats = [
  { name: 'Black', pct: '42%', value: 42, color: '#1D1A18' },
  { name: 'Gray', pct: '21%', value: 21, color: '#B8B3AD' },
  { name: 'White', pct: '15%', value: 15, color: '#EFEAE2' },
  { name: 'Beige', pct: '10%', value: 10, color: '#DECDB9' },
  { name: 'Pink', pct: '12%', value: 12, color: '#E8B8B2' },
]

function WelcomeIllustration() {
  return (
    <View style={styles.welcomeImageBox}>
      <Image source={WELCOME_IMAGE} style={styles.imageContain} resizeMode="contain" />
    </View>
  )
}

function OutfitCaptureIllustration() {
  const actions = [
    { label: '사진', icon: <Feather name="image" size={28} color={colors.text} /> },
    { label: '아바타', icon: <Feather name="cloud" size={28} color={colors.text} /> },
    { label: '직접 선택', icon: <Feather name="plus" size={30} color={colors.text} /> },
  ]

  return (
    <View style={styles.captureCard}>
      <View style={styles.captureHeader}>
        <Text style={styles.captureDate}>2026.05.30 (금)</Text>
        <Text style={styles.captureWeather}>⛅ 22°C</Text>
      </View>
      <View style={styles.captureImageBox}>
        <Image source={CAPTURE_IMAGE} style={styles.imageCover} resizeMode="cover" />
      </View>
      <View style={styles.captureActions}>
        {actions.map((action) => (
          <View key={action.label} style={styles.captureAction}>
            {action.icon}
            <Text style={styles.captureActionText}>{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function OutfitMemoIllustration() {
  return (
    <View style={styles.memoCard}>
      <Text style={styles.sectionLabel}>날씨</Text>
      <Text style={styles.weatherText}>⛅ 22°C</Text>
      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>오늘 기분</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>😊 좋음</Text>
        <Feather name="chevron-down" size={22} color={colors.textMuted} />
      </View>
      <Text style={[styles.sectionLabel, styles.memoLabel]}>오늘 한 줄</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>친구랑 카페 가는 날 ☕</Text>
      </View>
    </View>
  )
}

function ClosetIllustration() {
  return (
    <View style={styles.closetWrap}>
      <View style={styles.wardrobeImageBox}>
        <Image source={WARDROBE_IMAGE} style={styles.imageContain} resizeMode="contain" />
      </View>
      <View style={styles.sleepingCard}>
        <View style={styles.sleepingIcon}>
          <Text style={styles.sleepingIconText}>📦</Text>
        </View>
        <View style={styles.sleepingCopy}>
          <Text style={styles.sleepingTitle}>잠자는 옷이 많아요 😪</Text>
          <Text style={styles.sleepingText}>
            다시 꺼내 입으면{'\n'}새로운 코디를 완성할 수 있어요.
          </Text>
        </View>
        <Feather name="chevron-right" size={28} color={colors.textMuted} />
      </View>
    </View>
  )
}

function ReportIllustration() {
  return (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>월간 리포트</Text>
        <View style={styles.reportMonth}>
          <Text style={styles.reportArrow}>‹</Text>
          <Text style={styles.reportMonthText}>2026년 5월</Text>
          <Text style={styles.reportArrow}>›</Text>
        </View>
      </View>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>총 코디 수</Text>
        <Text style={styles.totalValue}>
          24<Text style={styles.totalUnit}> 회</Text>
        </Text>
      </View>
      <View style={styles.chartRow}>
        <DonutChart
          size={112}
          strokeWidth={34}
          segments={colorStats.map((item) => ({ value: item.value, color: item.color }))}
        />
        <View style={styles.legend}>
          {colorStats.map((item) => (
            <View key={item.name} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendName}>{item.name}</Text>
              <Text style={styles.legendPct}>{item.pct}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.reportDivider} />
      <Text style={styles.topTitle}>가장 많이 입은 아이템 TOP 3</Text>
      {[
        ['👢', '블랙 롱 부츠', '12회'],
        ['🧥', '네이비 후드', '10회'],
        ['👕', '슬리브리스', '8회'],
      ].map(([emoji, name, count]) => (
        <View key={name} style={styles.topRow}>
          <View style={styles.topThumb}>
            <Text style={styles.topEmoji}>{emoji}</Text>
          </View>
          <Text style={styles.topName}>{name}</Text>
          <Text style={styles.topCount}>{count}</Text>
        </View>
      ))}
    </View>
  )
}

function FinalIllustration() {
  return (
    <View style={styles.finalImageBox}>
      <Image source={FINAL_IMAGE} style={styles.imageContain} resizeMode="contain" />
    </View>
  )
}

export const ONBOARDING_ILLUSTRATIONS = [
  WelcomeIllustration,
  OutfitCaptureIllustration,
  OutfitMemoIllustration,
  ClosetIllustration,
  ReportIllustration,
  FinalIllustration,
]

const contentWidth = ONBOARDING_SCREEN_WIDTH - spacing.xl * 2
const imageBoxHeight = Math.min(ONBOARDING_SCREEN_HEIGHT * 0.4, 360)

const styles = StyleSheet.create({
  welcomeImageBox: {
    width: contentWidth,
    height: imageBoxHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContain: {
    width: '100%',
    height: '100%',
  },
  imageCover: {
    width: '100%',
    height: '100%',
  },
  captureCard: {
    width: contentWidth,
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  captureDate: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  captureWeather: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
  },
  captureImageBox: {
    height: Math.min(ONBOARDING_SCREEN_HEIGHT * 0.23, 220),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.secondary,
  },
  captureActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  captureAction: {
    flex: 1,
    height: 82,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  captureActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  memoCard: {
    width: contentWidth,
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textMuted,
  },
  weatherText: {
    marginTop: spacing.md,
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  inputBox: {
    height: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  inputText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  memoLabel: {
    marginTop: spacing.xl,
  },
  closetWrap: {
    width: contentWidth,
    gap: spacing.lg,
  },
  wardrobeImageBox: {
    height: Math.min(ONBOARDING_SCREEN_HEIGHT * 0.34, 310),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepingCard: {
    minHeight: 98,
    borderRadius: 24,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sleepingIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepingIconText: {
    fontSize: 24,
  },
  sleepingCopy: {
    flex: 1,
  },
  sleepingTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  sleepingText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  reportCard: {
    width: contentWidth,
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  reportMonth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reportArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textMuted,
  },
  reportMonthText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textMuted,
  },
  totalCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textMuted,
  },
  totalValue: {
    marginTop: spacing.xs,
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  totalUnit: {
    fontSize: 20,
    color: colors.textMuted,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  legendPct: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textMuted,
  },
  reportDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  topThumb: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topEmoji: {
    fontSize: 22,
  },
  topName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  topCount: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textMuted,
  },
  finalImageBox: {
    width: contentWidth * 0.72,
    height: Math.min(ONBOARDING_SCREEN_HEIGHT * 0.34, 300),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
})
