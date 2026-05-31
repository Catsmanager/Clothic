import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

export default function WardrobeHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>잠자는 옷장</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Feather name="help-circle" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Feather name="settings" size={20} color={colors.text} />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  helpButton: {
    padding: 2,
  },
})
