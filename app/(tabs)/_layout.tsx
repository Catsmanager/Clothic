import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/spacing'

function PlusTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.plusButton}>
      <Feather name="plus" size={24} color={colors.white} />
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <PlusTabIcon focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '옷장',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 4 : 8,
  },
})
