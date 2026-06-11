import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  onAddPress: () => void
  onHelpPress: () => void
}

export default function WardrobeHeader({ onAddPress, onHelpPress }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>잠자는 옷장</Text>
        <Text style={styles.headerSubtitle}>오랫동안 입지 않은 옷을 확인하세요</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={onHelpPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="잠자는 옷장 도움말 보기"
        >
          <Feather name="help-circle" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="옷 추가하기"
        >
          <Feather name="plus" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  helpButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
