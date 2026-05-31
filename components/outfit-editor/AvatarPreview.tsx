import { Image, StyleSheet, View } from 'react-native'
import { spacing } from '../../constants/spacing'

const BASE_AVATAR = require('../../assets/avatar/base/base_female_01.png')

export default function AvatarPreview() {
  return (
    <View style={styles.avatarArea}>
      <Image source={BASE_AVATAR} style={styles.avatarImage} resizeMode="contain" />
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
