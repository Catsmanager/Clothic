import { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { radius, spacing } from '../../constants/spacing'

interface Props {
  autoCapitalize?: TextInputProps['autoCapitalize']
  autoComplete?: TextInputProps['autoComplete']
  autoCorrect?: TextInputProps['autoCorrect']
  editable: boolean
  keyboardType?: TextInputProps['keyboardType']
  label: string
  onChangeText: (value: string) => void
  placeholder: string
  secureTextEntry?: boolean
  value: string
}

export default function AuthTextField({
  autoCapitalize,
  autoComplete,
  autoCorrect,
  editable,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
}: Props) {
  // 비밀번호 필드는 기본 가림 상태로 시작하고, 눈 버튼으로 표시/숨김을 전환한다.
  const [hidden, setHidden] = useState(true)
  const isSecure = secureTextEntry === true

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, isSecure && styles.inputWithToggle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          secureTextEntry={isSecure && hidden}
          editable={editable}
        />
        {isSecure && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setHidden((prev) => !prev)}
            disabled={!editable}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={hidden ? '비밀번호 표시' : '비밀번호 숨기기'}
          >
            <Feather name={hidden ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
