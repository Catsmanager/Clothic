import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { type CatalogItem, type Category } from '../../constants/items'
import { getAvatarItemImage } from '../../lib/avatarAssets'

const SCREEN_WIDTH = Dimensions.get('window').width
const ITEM_SIZE = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 3) / 4

type EquippedItems = Partial<Record<Category, string>>

interface Props {
  activeSubCategory: string
  equipped: EquippedItems
  items: CatalogItem[]
  subCategories: string[]
  onFullViewPress: () => void
  onItemPress: (item: CatalogItem) => void
  onSubCategoryPress: (subCategory: string) => void
}

export default function ItemPickerPanel({
  activeSubCategory,
  equipped,
  items,
  subCategories,
  onFullViewPress,
  onItemPress,
  onSubCategoryPress,
}: Props) {
  return (
    <View style={styles.bottomPanel}>
      <View style={styles.subTabHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabRow}
        >
          {subCategories.map((subCategory) => (
            <TouchableOpacity
              key={subCategory}
              style={[styles.subTab, activeSubCategory === subCategory && styles.subTabActive]}
              onPress={() => onSubCategoryPress(subCategory)}
            >
              <Text
                style={[
                  styles.subTabText,
                  activeSubCategory === subCategory && styles.subTabTextActive,
                ]}
              >
                {subCategory}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.fullViewBtn} onPress={onFullViewPress}>
          <Feather name="grid" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={4}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemCard,
              equipped[item.category] === item.id && styles.itemCardSelected,
            ]}
            onPress={() => onItemPress(item)}
          >
            <ItemPreview item={item} />
          </TouchableOpacity>
        )}
      />
    </View>
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
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    height: 280,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  subTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subTabRow: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  fullViewBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  subTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  subTabActive: {
    backgroundColor: colors.text,
  },
  subTabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  itemCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  itemColorBox: {
    width: '70%',
    height: '70%',
    borderRadius: 4,
  },
  itemAssetImage: {
    position: 'absolute',
    width: ITEM_SIZE * 2.2,
    height: ITEM_SIZE * 4.4,
    top: -ITEM_SIZE * 1.52,
  },
})
