import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  AVATAR_BACKGROUNDS,
  type AvatarBackground,
  type AvatarBackgroundId,
} from '../constants/avatarBackgrounds'
import { colors } from '../constants/colors'
import { radius, spacing } from '../constants/spacing'

interface Props {
  visible: boolean
  selectedId: AvatarBackgroundId
  onClose: () => void
  onSelect: (id: AvatarBackgroundId) => void
}

export default function HomeBackgroundSheet({ visible, selectedId, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessible={false} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>배경</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="배경 선택 닫기"
            >
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionGrid}>
            {AVATAR_BACKGROUNDS.map((background) => {
              const selected = background.id === selectedId
              return (
                <TouchableOpacity
                  key={background.id}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onSelect(background.id)
                    onClose()
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${background.label} 배경 선택`}
                  accessibilityState={{ selected }}
                >
                  <BackgroundPreview background={background} selected={selected} />
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {background.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    </Modal>
  )
}

function BackgroundPreview({
  background,
  selected,
}: {
  background: AvatarBackground
  selected: boolean
}) {
  return (
    <View style={[styles.preview, { backgroundColor: background.color }]}>
      <Image source={background.image} style={styles.previewImage} resizeMode="cover" />
      {selected && (
        <View style={styles.checkBadge}>
          <Feather name="check" size={14} color={colors.white} />
        </View>
      )}
    </View>
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
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    width: '47%',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.text,
  },
  preview: {
    height: 82,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.text,
  },
})
