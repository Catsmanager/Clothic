import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  title: string
}

export default function SettingsHeader({ title }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} hitSlop={8}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerButton} />
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
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
})
