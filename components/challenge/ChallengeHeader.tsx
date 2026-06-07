import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  onHelpPress: () => void
}

export default function ChallengeHeader({ onHelpPress }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>챌린지</Text>
      <TouchableOpacity style={styles.iconButton} onPress={onHelpPress} hitSlop={8}>
        <Feather name="help-circle" size={20} color={colors.textMuted} />
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
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
