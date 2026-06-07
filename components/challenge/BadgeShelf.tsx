import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { Badge, BadgeIcon } from '../../constants/challenges'

const ICON_MAP: Record<BadgeIcon, keyof typeof MaterialCommunityIcons.glyphMap> = {
  sprout: 'sprout',
  calendar: 'calendar-check-outline',
  wardrobe: 'wardrobe-outline',
  umbrella: 'umbrella-outline',
  lock: 'lock-outline',
}

interface Props {
  badges: Badge[]
  onViewAllPress: () => void
}

export default function BadgeShelf({ badges, onViewAllPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>획득한 배지</Text>
        <TouchableOpacity style={styles.viewAll} onPress={onViewAllPress} hitSlop={8}>
          <Text style={styles.viewAllText}>전체 보기</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelf}
      >
        {badges.map((badge) => {
          const locked = badge.earnedAt === null
          return (
            <View key={badge.id} style={styles.badge}>
              <View style={[styles.badgeCircle, locked && styles.badgeCircleLocked]}>
                <MaterialCommunityIcons
                  name={ICON_MAP[badge.icon]}
                  size={28}
                  color={locked ? colors.textMuted : colors.accent}
                />
              </View>
              <Text style={[styles.badgeName, locked && styles.badgeNameLocked]} numberOfLines={1}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDate}>{locked ? '준비 중' : badge.earnedAt}</Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  shelf: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  badge: {
    width: 72,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeCircleLocked: {
    backgroundColor: colors.secondary,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },
  badgeDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
})
