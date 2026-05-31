import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import type { SleepingItem } from '../../constants/sleepingWardrobe'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  items: SleepingItem[]
}

export default function SleepingItemList({ items }: Props) {
  return (
    <View style={styles.itemList}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} style={styles.itemCard}>
          <View style={[styles.itemThumbnail, { backgroundColor: item.color }]} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemTags}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemLastWornLabel}>마지막 착용</Text>
            <Text style={styles.itemLastWornDate}>{item.lastWorn}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  itemList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemThumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemLastWornLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemLastWornDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
})
