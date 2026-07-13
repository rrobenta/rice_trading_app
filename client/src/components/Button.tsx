import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, FontSize } from '../constants/theme';

type Variant = 'primary' | 'danger' | 'outline' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}` as keyof typeof styles], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 46,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: Colors.primary },
  danger:  { backgroundColor: Colors.danger },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  ghost:   { backgroundColor: 'transparent' },

  text: { fontSize: FontSize.md, fontWeight: '600' },
  text_primary: { color: '#fff' },
  text_danger:  { color: '#fff' },
  text_outline: { color: Colors.primary },
  text_ghost:   { color: Colors.textMuted },
});
