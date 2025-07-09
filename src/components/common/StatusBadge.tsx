import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'in_progress'
  | 'skipped'
  | 'cancelled'
  | 'maintenance'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'high'
  | 'moderate'
  | 'low'
  | 'none';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  style,
  textStyle,
  showIcon = false,
  label,
}) => {
  const getStatusColors = (): { bg: string; text: string } => {
    switch (status) {
      case 'active':
        return { bg: colors.success + '20', text: colors.success };
      case 'inactive':
        return { bg: colors.gray400 + '20', text: colors.gray600 };
      case 'pending':
        return { bg: colors.info + '20', text: colors.info };
      case 'completed':
        return { bg: colors.success + '20', text: colors.success };
      case 'in_progress':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'skipped':
        return { bg: colors.gray400 + '20', text: colors.gray600 };
      case 'cancelled':
        return { bg: colors.error + '20', text: colors.error };
      case 'maintenance':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'success':
        return { bg: colors.success + '20', text: colors.success };
      case 'warning':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'error':
        return { bg: colors.error + '20', text: colors.error };
      case 'info':
        return { bg: colors.info + '20', text: colors.info };
      case 'high':
        return { bg: colors.highWater + '20', text: colors.highWater };
      case 'moderate':
        return { bg: colors.moderateWater + '20', text: colors.moderateWater };
      case 'low':
        return { bg: colors.lowWater + '20', text: colors.lowWater };
      case 'none':
        return { bg: colors.noWater + '20', text: colors.noWater };
      default:
        return { bg: colors.gray200, text: colors.gray700 };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: 4,
          },
          text: {
            fontSize: 10,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
          },
          text: {
            fontSize: 14,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
          },
          text: {
            fontSize: 12,
          },
        };
    }
  };

  const formatStatusLabel = (status: StatusType): string => {
    if (label) return label;
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const { bg, text } = getStatusColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        sizeStyles.container,
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: text },
          sizeStyles.text,
          textStyle,
        ]}
      >
        {formatStatusLabel(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatusBadge;