import type { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { getCoreDataPhase } from '../lib/coreDataState'

interface Props {
  children: ReactNode
  error: string | null
  loading: boolean
  onRetry: () => void
  ready: boolean
}

export default function CoreDataState({ children, error, loading, onRetry, ready }: Props) {
  const phase = getCoreDataPhase(ready, error)

  if (phase === 'initial-error') {
    return (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <Text style={styles.errorTitle}>기록을 불러오지 못했어요.</Text>
        <Text style={styles.statusText}>연결을 확인하고 다시 시도해주세요.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="기록 다시 불러오기"
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (phase === 'initial-loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.statusText}>
          {loading ? '기록을 불러오는 중이에요.' : '기록을 준비하고 있어요.'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.content}>
      {error && (
        <View style={styles.inlineError} accessibilityLiveRegion="polite">
          <Text style={styles.inlineErrorText}>최신 기록을 불러오지 못했어요.</Text>
          <TouchableOpacity
            onPress={onRetry}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="최신 기록 다시 불러오기"
          >
            <Text style={styles.inlineRetryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  retryButton: {
    minHeight: 44,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  inlineError: {
    minHeight: 44,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineErrorText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  inlineRetryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
})
