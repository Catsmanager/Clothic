import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

export default function AuthLegalLinks() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/privacy')} hitSlop={8}>
        <Text style={styles.link}>개인정보 처리방침</Text>
      </TouchableOpacity>
      <Text style={styles.divider}>·</Text>
      <TouchableOpacity onPress={() => router.push('/terms')} hitSlop={8}>
        <Text style={styles.link}>서비스 이용약관</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  link: {
    fontSize: 11,
    color: colors.textMuted,
  },
  divider: {
    fontSize: 11,
    color: colors.textMuted,
  },
})
