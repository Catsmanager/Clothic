import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing, radius } from '../../constants/spacing'
import DonutChart from '../../components/DonutChart'
import { getItemById } from '../../constants/items'
import { type Outfit, useOutfitStore } from '../../stores/outfitStore'

interface MonthData {
  totalOutfits: number
  diffFromLastMonth: number
  topColors: { label: string; color: string; percent: number }[]
  topItems: { label: string; color: string; count: number }[]
  topStyles: { tag: string; count: number }[]
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function buildMonthData(outfits: Outfit[], year: number, month: number): MonthData | null {
  const currentKey = getMonthKey(year, month)
  const prevDate = new Date(year, month - 1, 1)
  const previousKey = getMonthKey(prevDate.getFullYear(), prevDate.getMonth())
  const currentOutfits = outfits.filter((outfit) => outfit.date.startsWith(currentKey))
  const previousCount = outfits.filter((outfit) => outfit.date.startsWith(previousKey)).length

  if (currentOutfits.length === 0) return null

  const itemCounts = new Map<string, { label: string; color: string; count: number }>()
  const colorCounts = new Map<string, { label: string; color: string; count: number }>()
  const styleCounts = new Map<string, { tag: string; count: number }>()

  currentOutfits.forEach((outfit) => {
    outfit.itemIds.forEach((itemId) => {
      const item = getItemById(itemId)
      if (!item) return

      const itemCount = itemCounts.get(item.id)
      itemCounts.set(item.id, {
        label: item.name,
        color: item.color,
        count: (itemCount?.count ?? 0) + 1,
      })

      const colorCount = colorCounts.get(item.color)
      colorCounts.set(item.color, {
        label: item.color,
        color: item.color,
        count: (colorCount?.count ?? 0) + 1,
      })

      item.styleTags.forEach((tag) => {
        const styleCount = styleCounts.get(tag)
        styleCounts.set(tag, { tag: `#${tag}`, count: (styleCount?.count ?? 0) + 1 })
      })
    })
  })

  const totalItemCount = [...colorCounts.values()].reduce((sum, item) => sum + item.count, 0)

  return {
    totalOutfits: currentOutfits.length,
    diffFromLastMonth: currentOutfits.length - previousCount,
    topColors: [...colorCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        label: item.label,
        color: item.color,
        percent: totalItemCount > 0 ? Math.round((item.count / totalItemCount) * 100) : 0,
      })),
    topItems: [...itemCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    topStyles: [...styleCounts.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  }
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function StatsScreen() {
  const outfits = useOutfitStore((s) => s.outfits)
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits)
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useEffect(() => {
    fetchOutfits()
  }, [fetchOutfits])

  const data = useMemo(() => buildMonthData(outfits, year, month), [outfits, year, month])

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
