import { StyleSheet, Text } from 'react-native'
import { colors } from '../../constants/colors'

interface Props {
  message: string | null
}

export default function AuthErrorText({ message }: Props) {
  if (!message) return null
  return <Text style={styles.error}>{message}</Text>
}

const styles = StyleSheet.create({
  error: {
    fontSize: 13,
    color: colors.danger,
  },
})
