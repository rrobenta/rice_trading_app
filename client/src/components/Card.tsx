import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 16,
    ...Shadow.sm,
  },
});
