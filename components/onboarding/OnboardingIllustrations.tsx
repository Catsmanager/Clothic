import type { ReactElement } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import DonutChart from '../DonutChart'
import { colors } from '../../constants/colors'
import { CONFETTI, COLOR_STATS, TOP_ITEMS } from '../../constants/onboarding'
import { radius, spacing } from '../../constants/spacing'
import { ONBOARDING_SCREEN_HEIGHT, ONBOARDING_SCREEN_WIDTH } from './layout'

const BASE_AVATAR = require('../../assets/avatar/base/base_female_01.png')
const ROOM_BG = require('../../assets/avatar/background/room_01.png')

function WelcomeIllustration() {
  return (
    <ImageBackground
      source={ROOM_BG}
      style={styles.welcomeBox}
      imageStyle={styles.welcomeBgImg}
      resizeMode="contain"
    >
      <Image source={BASE_AVATAR} style={styles.welcomeAvatar} resizeMode="contain" />
    </ImageBackground>
  )
}

function OutfitCaptureIllustration() {
  const actions: { label: string; icon: ReactElement }[] = [
    { label: '사진', icon: <Feather name="image" size={22} color={colors.text} /> },
    {
      label: '아바타',
      icon: <MaterialCommunityIcons name="hanger" size={22} color={colors.text} />,
    },
    { label: '직접 선택', icon: <Feather name="plus" size={22} color={colors.text} /> },
  ]

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardDateText}>2026.05.30 (금)</Text>
        <Text style={styles.cardWeatherText}>⛅ 22°C</Text>
      </View>
      <ImageBackground
        source={ROOM_BG}
        style={styles.cardImage}
        imageStyle={styles.cardImageBg}
        resizeMode="contain"
      >
        <Image source={BASE_AVATAR} style={styles.cardAvatar} resizeMode="contain" />
      </ImageBackground>
      <View style={styles.cardBtnRow}>
        {actions.map((action) => (
          <View key={action.label} style={styles.cardBtn}>
            <View style={styles.cardBtnIcon}>{action.icon}</View>
            <Text style={styles.cardBtnText}>{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function OutfitMemoIllustration() {
  return (
    <View style={styles.card}>
      <Text style={styles.fieldLabel}>날씨</Text>
      <Text style={styles.weatherValue}>⛅ 22°C</Text>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>오늘 기분</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>😊 좋음</Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </View>

      <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>오늘 한 줄</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>친구랑 카페 가는 날 ☕</Text>
      </View>
    </View>
  )
}

function ClosetIllustration() {
  return (
    <View style={styles.closetWrap}>
      <View style={styles.closetBox}>
        <View style={styles.closetRail} />
        <Text style={styles.closetHang}>🧥　👗　🧥　👚　👜</Text>
        <View style={styles.closetShelf}>
          <Text style={styles.closetShelfItems}>👞　👟　👜</Text>
        </View>
      </View>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Text style={styles.bannerIconText}>🧺</Text>
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>잠자는 옷이 많아요 😢</Text>
          <Text style={styles.bannerSub}>
            다시 꺼내 입으면{'\n'}새로운 코디를 완성할 수 있어요.
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </View>
  )
}

function ReportIllustration() {
  return (
    <View style={styles.card}>
      <View style={styles.reportHead}>
        <Text style={styles.reportTitle}>월간 리포트</Text>
        <View style={styles.monthNav}>
          <Feather name="chevron-left" size={16} color={colors.textMuted} />
          <Text style={styles.monthText}>2026년 5월</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>총 코디 수</Text>
      <Text style={styles.bigStat}>
        24 <Text style={styles.bigStatUnit}>회</Text>
      </Text>

      <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>가장 많이 입은 색상</Text>
      <View style={styles.colorRow}>
        <DonutChart
          size={88}
          strokeWidth={20}
          segments={COLOR_STATS.map((color) => ({
            value: parseInt(color.pct, 10),
            color: color.color,
          }))}
        />
        <View style={styles.legend}>
          {COLOR_STATS.map((color) => (
            <View key={color.name} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color.color }]} />
              <Text style={styles.legendName}>{color.name}</Text>
              <Text style={styles.legendPct}>{color.pct}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>가장 많이 입은 아이템 TOP 3</Text>
      <View style={styles.topList}>
        {TOP_ITEMS.map((item) => (
          <View key={item.name} style={styles.topRow}>
            <Text style={styles.topEmoji}>{item.emoji}</Text>
            <Text style={styles.topName}>{item.name}</Text>
            <Text style={styles.topCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function FinalIllustration() {
  return (
    <View style={styles.finalBox}>
      {CONFETTI.map((confetti, index) => (
        <Text
          key={index}
          style={[
            styles.confetti,
            { top: confetti.top, left: `${confetti.left}%`, fontSize: confetti.size },
          ]}
        >
          {confetti.emoji}
        </Text>
      ))}
      <Image source={BASE_AVATAR} style={styles.finalAvatar} resizeMode="contain" />
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

const illustrationWidth = ONBOARDING_SCREEN_WIDTH - spacing.xl * 2

const styles = StyleSheet.create({
  welcomeBox: {
    width: illustrationWidth,
    height: ONBOARDING_SCREEN_HEIGHT * 0.4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  welcomeBgImg: {
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
  },
  welcomeAvatar: {
    width: '46%',
    height: '78%',
  },
  card: {
    width: illustrationWidth,
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
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardImageBg: {
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
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
  closetWrap: {
    gap: spacing.md,
    width: '100%',
  },
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
  bannerIconText: {
    fontSize: 22,
  },
  bannerText: {
    flex: 1,
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
  topList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
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
  finalBox: {
    width: illustrationWidth,
    height: ONBOARDING_SCREEN_HEIGHT * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  finalAvatar: {
    width: '52%',
    height: '100%',
  },
})
