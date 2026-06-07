import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { Badge, BadgeIcon } from '../../constants/challenges'

interface Props {
  badges: Badge[]
  visible: boolean
  onClose: () => void
}

const ICON_MAP: Record<BadgeIcon, keyof typeof MaterialCommunityIcons.glyphMap> = {
  sprout: 'sprout',
  calendar: 'calendar-check-outline',
  wardrobe: 'wardrobe-outline',
  umbrella: 'umbrella-outline',
  lock: 'lock-outline',
}

export default function BadgeListSheet({ badges, visible, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>전체 배지</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {badges.map((badge) => {
              const locked = badge.earnedAt == null

              return (
                <View key={badge.id} style={styles.badgeRow}>
                  <View style={[styles.badgeIcon, locked && styles.badgeIconLocked]}>
                    <MaterialCommunityIcons
                      name={ICON_MAP[badge.icon]}
                      size={24}
                      color={locked ? colors.textMuted : colors.accent}
                    />
                  </View>
                  <View style={styles.badgeText}>
                    <Text style={[styles.badgeName, locked && styles.badgeNameLocked]}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeDate}>
                      {locked ? '조건 달성 전' : `${badge.earnedAt} 획득`}
                    </Text>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconLocked: {
    opacity: 0.7,
  },
  badgeText: {
    flex: 1,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },
  badgeDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
})
