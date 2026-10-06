import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/colors';

const FIELD_BORDER = '#B9C3F2'; // visible boundary when the field is not focused
const GREEN = '#1E8E3E';

/**
 * Password field with an eye icon to show/hide what is typed, a clear boundary
 * (bold blue when focused, red on error, green when confirmed) and a blinking
 * dot that marks where typing starts (visible while the field is empty).
 *
 * Used by the Login and Signup screens.
 */
export interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'style'> {
  /** true for new-password fields (signup), false for an existing password (login) */
  newPassword?: boolean;
  hasError?: boolean;
  isOk?: boolean;
}

export default function PasswordInput({
  value,
  onChangeText,
  newPassword = false,
  hasError = false,
  isOk = false,
  ...rest
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const blink = useRef(new Animated.Value(1)).current;
  const isEmpty = !value || value.length === 0;

  useEffect(() => {
    if (!isEmpty) return undefined;
    blink.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isEmpty, blink]);

  const borderColor = hasError ? colors.red : isOk ? GREEN : focused ? colors.blue : FIELD_BORDER;

  return (
    <View style={[styles.pwField, { borderColor }, focused && styles.pwFieldFocused]}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={newPassword ? 'password-new' : 'password'}
        textContentType={newPassword ? 'newPassword' : 'password'}
        cursorColor={colors.blue}
        selectionColor={colors.blue}
        placeholderTextColor="#9AA3C7"
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[styles.pwInput, { paddingLeft: isEmpty ? 30 : 13 }]}
      />

      {isEmpty ? (
        <View pointerEvents="none" style={styles.pwDotWrap} importantForAccessibility="no">
          <Animated.View style={[styles.pwDot, { opacity: blink }]} />
        </View>
      ) : null}

      <Pressable
        onPress={() => setShow((s) => !s)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={show ? 'Hide password' : 'Show password'}
        style={styles.pwToggle}
      >
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pwField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: colors.grayTint,
  },
  pwFieldFocused: { backgroundColor: '#FFFFFF' },
  pwInput: {
    flex: 1,
    paddingRight: 4,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  pwDotWrap: { position: 'absolute', left: 13, top: 0, bottom: 0, justifyContent: 'center' },
  pwDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  pwToggle: { paddingHorizontal: 12, alignSelf: 'stretch', justifyContent: 'center' },
});
