import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  cornerRadius?: 'small' | 'medium' | 'large' | 'none';
  backgroundColor?: string;
  borderColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  variant = 'default',
  cornerRadius = 'medium',
  backgroundColor,
  borderColor,
}) => {
  const getCornerRadius = (): number => {
    switch (cornerRadius) {
      case 'small':
        return 8;
      case 'medium':
        return 12;
      case 'large':
        return 16;
      case 'none':
        return 0;
      default:
        return 12;
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: backgroundColor || colors.white,
          borderWidth: 1,
          borderColor: borderColor || colors.border,
          shadowOpacity: 0,
        };
      case 'elevated':
        return {
          backgroundColor: backgroundColor || colors.white,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        };
      case 'flat':
        return {
          backgroundColor: backgroundColor || colors.backgroundLight,
          shadowOpacity: 0,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: backgroundColor || colors.white,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
    }
  };

  const cardStyles = [
    styles.card,
    { borderRadius: getCornerRadius() },
    getVariantStyles(),
    style,
  ];

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? {
        onPress: disabled ? undefined : onPress,
        activeOpacity: 0.7,
        disabled,
        style: cardStyles,
      }
    : { style: cardStyles };

  return <Wrapper {...wrapperProps}>{children}</Wrapper>;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default Card;