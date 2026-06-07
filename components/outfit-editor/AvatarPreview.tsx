import { StyleSheet, View } from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import OutfitAvatar from '../OutfitAvatar'

export default function AvatarPreview() {
  return (
    <View style={styles.avatarArea}>
      <OutfitAvatar style={styles.avatarImage} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.secondary,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  avatarImage: {
    width: '68%',
    height: '92%',
  },
})
