import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  onBackPress: () => void
  onSharePress: () => void
}

export default function StatsHeader({ onBackPress, onSharePress }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onBackPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
      >
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>스타일 리포트</Text>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onSharePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="스타일 리포트 공유하기"
      >
        <Feather name="share" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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
})
