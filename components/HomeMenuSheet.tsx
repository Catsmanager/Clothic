import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'
import { useAuthStore } from '../stores/authStore'

interface Props {
  visible: boolean
  onClose: () => void
}

type MenuItem = {
  icon: keyof typeof Feather.glyphMap
  label: string
  tone?: 'default' | 'danger'
  onPress: () => void
}

export default function HomeMenuSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const [signingOut, setSigningOut] = useState(false)
  const version = Constants.expoConfig?.version ?? '1.0.0'
  const email = user?.email ?? '로그인 정보 없음'

  async function handleSignOut() {
    Alert.alert('로그아웃', '현재 계정에서 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true)
          const { error } = await signOut()
          setSigningOut(false)
          if (error) {
            Alert.alert('로그아웃 실패', error)
            return
          }
          onClose()
        },
      },
    ])
  }

  function openRoute(path: string) {
    onClose()
    router.push(path)
  }

  const menuItems: MenuItem[] = [
    {
      icon: 'user',
      label: '내 프로필 / 사용자 정보',
      onPress: () => openRoute('/profile'),
    },
    {
      icon: 'bell',
      label: '알림 설정',
      onPress: () => openRoute('/settings/notifications'),
    },
    {
      icon: 'settings',
      label: '앱 설정',
      onPress: () => openRoute('/settings/app'),
    },
    {
      icon: 'mail',
      label: '문의하기',
      onPress: () => openRoute('/contact'),
    },
    {
      icon: 'log-out',
      label: signingOut ? '로그아웃 중' : '로그아웃',
      tone: 'danger',
      onPress: handleSignOut,
    },
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>메뉴</Text>
              <Text style={styles.subtitle}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.row}
                onPress={item.onPress}
                disabled={signingOut && item.icon === 'log-out'}
                activeOpacity={0.82}
              >
                <View style={[styles.iconBox, item.tone === 'danger' && styles.iconBoxDanger]}>
                  {signingOut && item.icon === 'log-out' ? (
                    <ActivityIndicator size="small" color={colors.danger} />
                  ) : (
                    <Feather
                      name={item.icon}
                      size={18}
                      color={item.tone === 'danger' ? colors.danger : colors.text}
                    />
                  )}
                </View>
                <Text style={[styles.rowText, item.tone === 'danger' && styles.rowTextDanger]}>
                  {item.label}
                </Text>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}

            <View style={styles.legalArea}>
              <View style={styles.legalLinks}>
                <TouchableOpacity onPress={() => openRoute('/privacy')} hitSlop={8}>
                  <Text style={styles.legalLink}>개인정보 처리방침</Text>
                </TouchableOpacity>
                <Text style={styles.legalDivider}>·</Text>
                <TouchableOpacity onPress={() => openRoute('/terms')} hitSlop={8}>
                  <Text style={styles.legalLink}>서비스 이용약관</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => openRoute('/app-info')} hitSlop={8}>
                <Text style={styles.versionText}>Clothic {version}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDanger: {
    backgroundColor: '#F7E8EA',
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowTextDanger: {
    color: colors.danger,
  },
  legalArea: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legalLink: {
    fontSize: 11,
    color: colors.textMuted,
  },
  legalDivider: {
    fontSize: 11,
    color: colors.textMuted,
  },
  versionText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
})
