import { StyleSheet, View } from 'react-native'
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
    paddingBottom: spacing.sm,
  },
  avatarImage: {
    width: '75%',
    height: '90%',
  },
})
