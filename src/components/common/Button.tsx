// import React from 'react';
// import {
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ViewStyle,
//   TextStyle,
//   TouchableOpacityProps,
// } from 'react-native';
// import { colors } from '../../constants/colors';

// export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
// export type ButtonSize = 'small' | 'medium' | 'large';

// interface ButtonProps extends TouchableOpacityProps {
//   title: string;
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   isLoading?: boolean;
//   loadingText?: string;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
//   disabled?: boolean;
//   style?: ViewStyle;
//   textStyle?: TextStyle;
// }

// const Button: React.FC<ButtonProps> = ({
//   title,
//   variant = 'primary',
//   size = 'medium',
//   isLoading = false,
//   loadingText,
//   leftIcon,
//   rightIcon,
//   disabled = false,
//   style,
//   textStyle,
//   onPress,
//   ...props
// }) => {
//   const getBackgroundColor = (): string => {
//     if (disabled) return colors.gray400;
    
//     switch (variant) {
//       case 'secondary':
//         return colors.secondary;
//       case 'outline':
//       case 'ghost':
//         return colors.backgroundLight;
//       default:
//         return colors.primary;
//     }
//   };

//   const getBorderColor = (): string => {
//     if (disabled) return colors.gray400;
    
//     switch (variant) {
//       case 'outline':
//         return colors.primary;
//       default:
//         return 'transparent';
//     }
//   };

//   const getTextColor = (): string => {
//     if (disabled) return colors.gray600;
    
//     switch (variant) {
//       case 'outline':
//       case 'ghost':
//         return colors.primary;
//       default:
//         return colors.white;
//     }
//   };

//   const getPadding = (): ViewStyle => {
//     switch (size) {
//       case 'small':
//         return { paddingVertical: 8, paddingHorizontal: 16 };
//       case 'large':
//         return { paddingVertical: 16, paddingHorizontal: 32 };
//       default:
//         return { paddingVertical: 12, paddingHorizontal: 24 };
//     }
//   };

//   const getFontSize = (): number => {
//     switch (size) {
//       case 'small':
//         return 14;
//       case 'large':
//         return 18;
//       default:
//         return 16;
//     }
//   };

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       disabled={disabled || isLoading}
//       style={[
//         styles.button,
//         {
//           backgroundColor: getBackgroundColor(),
//           borderColor: getBorderColor(),
//         },
//         getPadding(),
//         variant === 'outline' && styles.outlineButton,
//         style,
//       ]}
//       {...props}
//     >
//       {isLoading ? (
//         <>
//           <ActivityIndicator
//             color={getTextColor()}
//             size={size === 'small' ? 'small' : 'small'}
//             style={styles.loader}
//           />
//           {loadingText && (
//             <Text
//               style={[
//                 styles.text,
//                 { color: getTextColor(), fontSize: getFontSize() },
//                 textStyle,
//               ]}
//             >
//               {loadingText}
//             </Text>
//           )}
//         </>
//       ) : (
//         <React.Fragment>
//           {leftIcon && <span style={styles.leftIcon}>{leftIcon}</span>}
//           <Text
//             style={[
//               styles.text,
//               { color: getTextColor(), fontSize: getFontSize() },
//               textStyle,
//             ]}
//           >
//             {title}
//           </Text>
//           {rightIcon && <span style={styles.rightIcon}>{rightIcon}</span>}
//         </React.Fragment>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   outlineButton: {
//     borderWidth: 1,
//   },
//   text: {
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   loader: {
//     marginRight: 8,
//   },
//   leftIcon: {
//     marginRight: 8,
//   },
//   rightIcon: {
//     marginLeft: 8,
//   },
// });

// export default Button;

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const getBackgroundColor = (): string => {
    if (disabled) return colors.gray400;
    
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'ghost':
        return colors.backgroundLight;
      default:
        return colors.primary;
    }
  };

  const getBorderColor = (): string => {
    if (disabled) return colors.gray400;
    
    switch (variant) {
      case 'outline':
        return colors.primary;
      default:
        return 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.gray600;
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  const getPadding = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        getPadding(),
        variant === 'outline' && styles.outlineButton,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <>
          <ActivityIndicator
            color={getTextColor()}
            size={size === 'small' ? 'small' : 'small'}
            style={styles.loader}
          />
          {loadingText && (
            <Text
              style={[
                styles.text,
                { color: getTextColor(), fontSize: getFontSize() },
                textStyle,
              ]}
            >
              {loadingText}
            </Text>
          )}
        </>
      ) : (
        <React.Fragment>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outlineButton: {
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;