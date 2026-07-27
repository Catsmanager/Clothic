import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
  hasOutfit: boolean
  mood: string | null
  memo: string | null
  onMoodPress: () => void
  onMemoPress: () => void
}

export default function MoodMemoCard({ hasOutfit, mood, memo, onMoodPress, onMemoPress }: Props) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={onMoodPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          hasOutfit ? '오늘 기분 기록하기' : '코디를 먼저 만들고 오늘 기분 기록하기'
        }
        accessibilityHint={!hasOutfit ? '코디 만들기 화면으로 이동합니다' : undefined}
      >
        <Text style={styles.label}>오늘 기분</Text>
        <Text style={styles.value}>
          {mood
            ? (MOOD_LABEL[mood] ?? mood)
            : hasOutfit
              ? '지금 기분은 어떤가요?'
              : '코디를 기록하고 기분도 남겨보세요.'}
        </Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.row}
        onPress={onMemoPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          hasOutfit ? '오늘 한 줄 기록하기' : '코디를 먼저 만들고 오늘 한 줄 기록하기'
        }
        accessibilityHint={!hasOutfit ? '코디 만들기 화면으로 이동합니다' : undefined}
      >
        <Text style={styles.label}>오늘 한 줄</Text>
        <Text style={styles.memo} numberOfLines={2}>
          {memo ??
            (hasOutfit ? '오늘을 한 문장으로 남겨보세요.' : '코디를 기록하고 하루도 남겨보세요.')}
        </Text>
      </TouchableOpacity>
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
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
})
