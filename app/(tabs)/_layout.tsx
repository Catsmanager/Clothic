import type { ReactNode } from 'react'
import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius } from '../../constants/spacing'

function TabIcon({ children, focused }: { children: ReactNode; focused: boolean }) {
  return <View style={[styles.iconShell, focused && styles.iconShellActive]}>{children}</View>
}

function PlusTabIcon() {
  return (
    <View style={styles.plusButton}>
      <Feather name="plus" size={26} color={colors.white} />
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const tabBarBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 58 + tabBarBottomPadding,
            paddingBottom: tabBarBottomPadding,
          },
        ],
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather name="home" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather name="calendar" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => <PlusTabIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons name="bar-chart-outline" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '옷장',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons name="archive-outline" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: 8,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    marginTop: 1,
    minHeight: 14,
  },
  tabItem: {
    paddingVertical: 4,
  },
  iconShell: {
    width: 34,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    backgroundColor: colors.secondary,
  },
  plusButton: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 18 : 22,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
})
