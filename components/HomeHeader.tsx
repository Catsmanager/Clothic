import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} hitSlop={8}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>오늘의 코디</Text>
      <TouchableOpacity
        style={styles.challengeButton}
        onPress={() => router.push('/challenge')}
        hitSlop={8}
      >
        <Feather name="award" size={16} color={colors.text} />
        <Text style={styles.challengeText}>챌린지</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
  challengeButton: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
  },
  challengeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
