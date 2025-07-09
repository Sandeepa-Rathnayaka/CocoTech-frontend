import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/colors';

interface ConfidenceGaugeProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  labelText?: string;
  style?: ViewStyle;
  gaugeColor?: string;
  trackColor?: string;
  valueTextStyle?: TextStyle;
  labelStyle?: TextStyle;
  thickness?: number;
}

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  value,
  size = 'medium',
  showLabel = true,
  labelText = 'Confidence',
  style,
  gaugeColor,
  trackColor,
  valueTextStyle,
  labelStyle,
  thickness,
}) => {
  // Ensure value is between 0 and 100
  const safeValue = Math.min(Math.max(0, value), 100);
  
  // Determine size dimensions
  const getDimensions = (): {
    width: number;
    height: number;
    fontSize: number;
    strokeWidth: number;
  } => {
    switch (size) {
      case 'small':
        return {
          width: 60,
          height: 60,
          fontSize: 14,
          strokeWidth: thickness || 6,
        };
      case 'large':
        return {
          width: 120,
          height: 120,
          fontSize: 24,
          strokeWidth: thickness || 10,
        };
      default:
        return {
          width: 80,
          height: 80,
          fontSize: 18,
          strokeWidth: thickness || 8,
        };
    }
  };

  // Calculate color based on value
  const getColor = (): string => {
    if (gaugeColor) return gaugeColor;
    
    if (safeValue >= 90) return colors.success;
    if (safeValue >= 70) return colors.primary;
    if (safeValue >= 50) return colors.warning;
    return colors.error;
  };

  const { width, height, fontSize, strokeWidth } = getDimensions();
  const radius = (Math.min(width, height) - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - safeValue / 100);
  const centerX = width / 2;
  const centerY = height / 2;
  const color = getColor();

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height}>
        {/* Background track */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={trackColor || colors.gray200}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${centerX}, ${centerY})`}
        />
        
        {/* Value text */}
        <SvgText
          x={centerX}
          y={centerY}
          textAnchor="middle"
          //dominantBaseline="middle"
          fill={valueTextStyle?.color || colors.textPrimary}
          fontSize={fontSize}
          fontWeight="bold"
        >
          {Math.round(safeValue)}%
        </SvgText>
      </Svg>

      {showLabel && (
        <Text style={[styles.label, labelStyle]}>
          {labelText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: colors.gray600,
    textAlign: 'center',
  },
});

export default ConfidenceGauge;