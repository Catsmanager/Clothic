import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'
import { type CatalogItem, type Category } from '../../constants/items'
import ItemPreviewThumb from '../ItemPreviewThumb'

const COLUMN_COUNT = 4
const ITEM_GAP = spacing.sm

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
  const { width } = useWindowDimensions()
  const itemSize = (width - spacing.md * 2 - ITEM_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              추후 업데이트될 예정입니다{'\n'}조금만 기다려주세요
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemCard,
              { width: itemSize, height: itemSize },
              equipped[item.category] === item.id && styles.itemCardSelected,
            ]}
            onPress={() => onItemPress(item)}
          >
            <ItemPreview item={item} itemSize={itemSize} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

function ItemPreview({ item, itemSize }: { item: CatalogItem; itemSize: number }) {
  return <ItemPreviewThumb item={item} size={itemSize} />
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
    gap: ITEM_GAP,
  },
  gridRow: {
    gap: ITEM_GAP,
  },
  itemCard: {
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
