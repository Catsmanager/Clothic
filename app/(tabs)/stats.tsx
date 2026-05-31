import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import DonutChart from '../../components/DonutChart'

// ── mock 데이터 ────────────────────────────────────────────────
interface MonthData {
  totalOutfits: number
  diffFromLastMonth: number
  topColors: Array<{ label: string; color: string; percent: number }>
  topItems: Array<{ label: string; color: string; count: number }>
  topStyles: Array<{ tag: string; count: number }>
}

const MONTH_DATA: Record<string, MonthData> = {
  '2026-05': {
    totalOutfits: 24,
    diffFromLastMonth: 6,
    topColors: [
      { label: 'Black', color: '#1C1C1C', percent: 42 },
      { label: 'Gray', color: '#8A8A8A', percent: 21 },
      { label: 'White', color: '#E8E8E8', percent: 15 },
      { label: 'Beige', color: '#D4C4A8', percent: 10 },
      { label: 'Pink', color: '#F4A0A0', percent: 12 },
    ],
    topItems: [
      { label: '블랙 롱 부츠', color: '#1C1C1C', count: 12 },
      { label: '네이비 후드', color: '#2C3E6B', count: 10 },
      { label: '슬리브리스', color: '#2A2A2A', count: 8 },
      { label: '숄더백', color: '#1C1C1C', count: 7 },
      { label: '볼캡', color: '#6A7A5A', count: 6 },
    ],
    topStyles: [
      { tag: '#캐주얼', count: 10 },
      { tag: '#데일리룩', count: 8 },
      { tag: '#스트릿', count: 6 },
    ],
  },
  '2026-04': {
    totalOutfits: 18,
    diffFromLastMonth: -2,
    topColors: [
      { label: 'Beige', color: '#D4C4A8', percent: 35 },
      { label: 'White', color: '#E8E8E8', percent: 28 },
      { label: 'Black', color: '#1C1C1C', percent: 20 },
      { label: 'Pink', color: '#F4A0A0', percent: 17 },
    ],
    topItems: [
      { label: '화이트 티셔츠', color: '#F0F0F0', count: 9 },
      { label: '베이지 스커트', color: '#C8B89A', count: 7 },
      { label: '스니커즈', color: '#F0F0F0', count: 6 },
      { label: '토트백', color: '#E8DCC8', count: 5 },
      { label: '크림 가디건', color: '#D4C4A8', count: 4 },
    ],
    topStyles: [
      { tag: '#페미닌', count: 8 },
      { tag: '#미니멀', count: 7 },
      { tag: '#캐주얼', count: 3 },
    ],
  },
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function StatsScreen() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const key = getMonthKey(year, month)
  const data: MonthData | null = MONTH_DATA[key] ?? null

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>월간 리포트</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="share" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* 월 네비게이션 */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data == null ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>이 달의 코디 기록이 없어요</Text>
          </View>
        ) : (
          <>
            {/* 총 코디 수 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>총 코디 수</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalCount}>{data.totalOutfits}</Text>
                <Text style={styles.totalUnit}> 회</Text>
                <View style={styles.spacer} />
                <Text
                  style={[
                    styles.diff,
                    data.diffFromLastMonth >= 0 ? styles.diffUp : styles.diffDown,
                  ]}
                >
                  지난 달보다 {Math.abs(data.diffFromLastMonth)}회{' '}
                  {data.diffFromLastMonth >= 0 ? '↑' : '↓'}
                </Text>
              </View>
            </View>

            {/* 가장 많이 입은 색상 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>가장 많이 입은 색상</Text>
              <View style={styles.colorRow}>
                <DonutChart
                  segments={data.topColors.map((c) => ({ value: c.percent, color: c.color }))}
                  size={130}
                  strokeWidth={34}
                />
                <View style={styles.colorLegend}>
                  {data.topColors.map((c) => (
                    <View key={c.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                      <Text style={styles.legendLabel}>{c.label}</Text>
                      <Text style={styles.legendPercent}>{c.percent}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 가장 많이 입은 아이템 TOP 5 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>가장 많이 입은 아이템 TOP 5</Text>
              <View style={styles.itemList}>
                {data.topItems.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={[styles.itemIcon, { backgroundColor: item.color }]} />
                    <Text style={styles.itemName}>{item.label}</Text>
                    <Text style={styles.itemCount}>{item.count}회</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 많이 입은 스타일 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>많이 입은 스타일</Text>
              <View style={styles.styleGrid}>
                <View style={styles.styleTags}>
                  {data.topStyles.map((s) => (
                    <View key={s.tag} style={styles.styleTag}>
                      <Text style={styles.styleTagText}>{s.tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.styleCounts}>
                  {data.topStyles.map((s) => (
                    <Text key={s.tag} style={styles.styleCount}>
                      {s.count}회
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* 팁 카드 */}
            <View style={[styles.card, styles.tipCard]}>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>💡 잠자는 옷을 활용해보세요!</Text>
                <Text style={styles.tipBody}>
                  안 입는 옷을 정리하면 새로운 스타일을{'\n'}발견할 수 있어요.
                </Text>
              </View>
              <Text style={styles.tipIllustration}>🧥</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── 스타일 ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  // 월 네비게이션
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  navBtn: {
    padding: spacing.xs,
  },
  navArrow: {
    fontSize: 18,
    color: colors.text,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 120,
    textAlign: 'center',
  },

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // 공통 카드
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },

  // 총 코디 수
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 48,
  },
  totalUnit: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '400',
    paddingBottom: 6,
  },
  spacer: { flex: 1 },
  diff: {
    fontSize: 13,
    fontWeight: '500',
    paddingBottom: 6,
  },
  diffUp: { color: '#3DB87A' },
  diffDown: { color: colors.danger },

  // 색상 차트
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  colorLegend: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  legendPercent: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // 아이템 TOP 5
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  itemCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // 스타일 태그
  styleGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  styleTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignContent: 'flex-start',
  },
  styleTag: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  styleTagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  styleCounts: {
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  styleCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // 팁 카드
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipContent: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  tipIllustration: {
    fontSize: 48,
    marginLeft: spacing.sm,
  },

  // 빈 상태
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
})
