import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'

const MOOD_LABEL: Record<string, string> = {
  happy: '😊 좋음',
  confident: '😎 자신감',
  cozy: '🥰 포근함',
  tired: '😴 피곤함',
  excited: '🤩 신남',
  calm: '😌 평온함',
}

interface Props {
  mood: string | null
  memo: string | null
}

export default function MoodMemoCard({ mood, memo }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>오늘 기분</Text>
        <Text style={styles.value}>{mood ? (MOOD_LABEL[mood] ?? mood) : '—'}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.label}>오늘 한 줄</Text>
      <Text style={styles.memo} numberOfLines={2}>
        {memo ?? '오늘의 코디를 기록해보세요'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  memo: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
})
