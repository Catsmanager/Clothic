import { StyleSheet, View } from 'react-native'
import type { CatalogItem } from '../../constants/items'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'
import OutfitAvatar from '../OutfitAvatar'

interface Props {
  items: CatalogItem[]
}

export default function AvatarPreview({ items }: Props) {
  return (
    <View style={styles.avatarArea}>
      <OutfitAvatar items={items} style={styles.avatarImage} />
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
