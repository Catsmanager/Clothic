import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'
import { getAvatarItemImage } from '../../lib/avatarAssets'

const SCREEN_WIDTH = Dimensions.get('window').width
const COLUMN_COUNT = 3
const CARD_GAP = spacing.sm
const HORIZONTAL_PADDING = spacing.md
const CARD_SIZE =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT

interface Props {
  items: CatalogItem[]
  onItemPress: (item: CatalogItem) => void
}

export default function ItemGrid({ items, onItemPress }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemWrapper}
          onPress={() => onItemPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.itemCard}>
            <ItemPreview item={item} />
          </View>
          <Text style={styles.itemLabel} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  )
}

function ItemPreview({ item }: { item: CatalogItem }) {
  const source = getAvatarItemImage(item.id)

  if (source == null) {
    return <View style={[styles.itemColorBox, { backgroundColor: item.color }]} />
  }

  return <Image source={source} style={styles.itemAssetImage} resizeMode="contain" />
}

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.xxl,
    gap: CARD_GAP,
  },
  itemWrapper: {
    width: CARD_SIZE,
    marginRight: CARD_GAP,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  itemCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemColorBox: {
    width: '65%',
    height: '65%',
    borderRadius: radius.sm,
  },
  itemAssetImage: {
    position: 'absolute',
    width: CARD_SIZE * 2.2,
    height: CARD_SIZE * 4.4,
    top: -CARD_SIZE * 1.52,
  },
  itemLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '400',
  },
})
