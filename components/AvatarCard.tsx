import {
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { spacing, radius } from '../constants/spacing'

const CARD_WIDTH = Dimensions.get('window').width - spacing.md * 2
const BASE_AVATAR = require('../assets/avatar/base/base_female_01.png')
// 아바타 뒤 방 배경 (오늘의 코디 카드)
const ROOM_BACKGROUND = require('../assets/avatar/background/room_01.png')

interface Props {
  onEdit?: () => void
  onCopy?: () => void
  onDelete?: () => void
}

export default function AvatarCard({ onEdit, onCopy, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <ImageBackground source={ROOM_BACKGROUND} style={styles.avatarArea} resizeMode="cover">
        <Image source={BASE_AVATAR} style={styles.avatarImage} resizeMode="contain" />
      </ImageBackground>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
          <Feather name="copy" size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Feather name="trash-2" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.9,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  avatarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '60%',
    height: '95%',
  },
  actions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    gap: spacing.xs,
  },
  actionBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
})
