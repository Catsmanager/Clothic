import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} hitSlop={8}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>오늘의 코디</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push('/challenge')}
        hitSlop={8}
      >
        <Feather name="award" size={22} color={colors.text} />
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
