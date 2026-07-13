import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize } from '../constants/theme';

type Variant = 'green' | 'red' | 'yellow' | 'gray' | 'blue';

interface Props {
  label: string;
  variant?: Variant;
}

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  green:  { bg: '#d8f3dc', color: '#1b4332' },
  red:    { bg: '#ffe0e0', color: '#7b1a1a' },
  yellow: { bg: '#fff3cd', color: '#664d03' },
  gray:   { bg: '#e9ecef', color: '#495057' },
  blue:   { bg: '#dbeafe', color: '#1e40af' },
};

export default function Badge({ label, variant = 'gray' }: Props) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
