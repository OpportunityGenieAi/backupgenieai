import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const MISMATCH = "Passwords don't match.";
const FIELD_BORDER = '#B9C3F2'; // always-visible boundary when a password field is not focused

/**
 * Password field with an optional Show/Hide toggle, a clear boundary
 * (bold blue when focused, red on error) and a blinking dot that marks
 * where typing starts (visible while the field is empty).
 */
interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'style'> {
  newPassword?: boolean;
  hasError?: boolean;
}

function PasswordInput({ value, onChangeText, newPassword = false, hasError = false, ...rest }: PasswordInputProps) {
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

  const borderColor = hasError ? colors.red : focused ? colors.blue : FIELD_BORDER;

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
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={styles.pwInput}
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
        <Text style={styles.pwToggleText}>{show ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    setLocalError(null);
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      setLocalError('Fill in every field (password needs 6+ characters).');
      return;
    }
    if (password !== confirm) {
      setLocalError(MISMATCH);
      return;
    }
    setSubmitting(true);
    const ok = await signup({ name: name.trim(), email: email.trim(), password });
    setSubmitting(false);
    if (ok) navigation.replace('VerifyEmail', { email: email.trim() });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.sub}>Free — takes under a minute.</Text>
      {(localError || error) && (
        <View style={styles.errorBox}><Text style={styles.errorText}>{localError || error}</Text></View>
      )}

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Password</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            newPassword
            hasError={localError === MISMATCH}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Confirm</Text>
          <PasswordInput
            value={confirm}
            onChangeText={setConfirm}
            newPassword
            hasError={localError === MISMATCH}
          />
        </View>
      </View>

      <Pressable style={styles.primaryBtn} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create account</Text>}
      </Pressable>

      <Pressable style={{ marginTop: 16, alignItems: 'center' }} onPress={() => navigation.replace('Login')}>
        <Text style={styles.linkText}>Already registered? Log in</Text>
      </Pressable>
      <Pressable
        style={{ marginTop: 20, alignSelf: 'flex-start' }}
        onPress={() => Linking.openURL('https://opportunitygenie.org/static/privacy-policy.html')}
      >
        <Text style={styles.footerLinkText}>Read our Privacy Policy</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  heading: { fontFamily: fonts.extraBold, fontSize: 21, color: colors.ink, marginBottom: 4 },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginBottom: 20 },
  errorBox: { backgroundColor: colors.redTint, borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { fontFamily: fonts.regular, color: colors.red, fontSize: 12.5 },
  label: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.inkSoft, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: colors.grayTint, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  primaryBtn: { backgroundColor: colors.blue, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  linkText: { fontFamily: fonts.bold, fontSize: 13, color: colors.blue },
  footerLinkText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textDecorationLine: 'underline' },

  // Password field
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
    paddingLeft: 13,
    paddingRight: 4,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  pwDotWrap: { position: 'absolute', left: 13, top: 0, bottom: 0, justifyContent: 'center' },
  pwDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  pwToggle: { paddingHorizontal: 10, alignSelf: 'stretch', justifyContent: 'center' },
  pwToggleText: { fontFamily: fonts.bold, fontSize: 12, color: colors.blue },
});