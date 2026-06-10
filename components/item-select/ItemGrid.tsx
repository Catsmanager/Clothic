import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import type { CatalogItem } from '../../constants/items'
import { getAvatarItemImage } from '../../lib/avatarAssets'

const COLUMN_COUNT = 3
const CARD_GAP = spacing.sm
const HORIZONTAL_PADDING = spacing.md

interface Props {
  items: CatalogItem[]
  onItemPress: (item: CatalogItem) => void
}

export default function ItemGrid({ items, onItemPress }: Props) {
  const { width } = useWindowDimensions()
  const cardSize = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.itemWrapper, { width: cardSize }]}
          onPress={() => onItemPress(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.itemCard, { width: cardSize, height: cardSize }]}>
            <ItemPreview item={item} itemSize={cardSize} />
          </View>
          <Text style={styles.itemLabel} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  )
}

function ItemPreview({ item, itemSize }: { item: CatalogItem; itemSize: number }) {
  const source = getAvatarItemImage(item.id)

  if (source == null) {
    return <View style={[styles.itemColorBox, { backgroundColor: item.color }]} />
  }

  return (
    <Image
      source={source}
      style={[
        styles.itemAssetImage,
        {
          width: itemSize * 2.2,
          height: itemSize * 4.4,
          top: -itemSize * 1.52,
        },
      ]}
      resizeMode="contain"
    />
  )
}

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.xxl,
    gap: CARD_GAP,
  },
  itemWrapper: {
    marginRight: CARD_GAP,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  itemCard: {
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
  },
  itemLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '400',
  },
})
