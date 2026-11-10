import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native'
import { colors } from '../../constants/colors'
import { spacing } from '../../constants/spacing'

interface Props {
  title: string
  subtitle: string
  illustration?: ImageSourcePropType
  illustrationStyle?: StyleProp<ImageStyle>
  centered?: boolean
}

export default function AuthHeader({
  title,
  subtitle,
  illustration,
  illustrationStyle,
  centered = false,
}: Props) {
  return (
    <View style={[styles.header, centered && styles.headerCentered]}>
      {illustration && (
        <Image
          source={illustration}
          style={[styles.illustration, illustrationStyle]}
          resizeMode="contain"
          accessible={false}
          accessibilityIgnoresInvertColors
        />
      )}
      <Text style={[styles.title, centered && styles.textCentered]}>{title}</Text>
      <Text style={[styles.subtitle, centered && styles.textCentered]}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  headerCentered: {
    alignItems: 'center',
  },
  illustration: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  textCentered: {
    textAlign: 'center',
  },
})
