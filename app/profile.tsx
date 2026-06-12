import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import SettingsHeader from '../components/settings/SettingsHeader'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const email = user?.email ?? '로그인 정보 없음'
  const joinedAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'

  async function handleSignOut() {
    const { error } = await signOut()
    if (error) {
      Alert.alert('로그아웃 실패', error)
      return
    }
    router.replace('/login')
  }

  function handleDeleteAccount() {
    setDeleteConfirmOpen(true)
  }

  async function confirmDeleteAccount() {
    if (deleting) return

    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    if (error) {
      Alert.alert('계정 삭제 실패', error)
      return
    }
    router.replace('/login')
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SettingsHeader title="내 프로필" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={28} color={colors.text} />
          </View>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.meta}>가입일 {joinedAt}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="이메일" value={email} />
          <InfoRow label="사용자 ID" value={user?.id ?? '-'} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={deleting || deleteConfirmOpen}
        >
          <Text style={styles.deleteText}>{deleting ? '삭제 중...' : '계정 삭제'}</Text>
        </TouchableOpacity>

        {deleteConfirmOpen && (
          <View style={styles.deleteConfirmCard}>
            <Text style={styles.deleteConfirmTitle}>정말 계정을 삭제할까요?</Text>
            <Text style={styles.deleteConfirmDesc}>
              계정, 저장한 코디, 등록한 아이템이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </Text>
            <View style={styles.deleteConfirmActions}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelDeleteText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, deleting && styles.deleteButtonDisabled]}
                onPress={confirmDeleteAccount}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? '삭제 중...' : '영구 삭제'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  email: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  infoRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  logoutButton: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  deleteButton: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  deleteConfirmCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    gap: spacing.sm,
  },
  deleteConfirmTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  deleteConfirmDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelDeleteButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  confirmDeleteButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
})
