import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';

const RING = 64;
const DOT = 14;
const BG = '#FFFFFF';
const SPINNER_OFFSET_Y = 0; // positive moves the spinner lower, e.g. 140

export default function LaunchScreen() {
  const spin = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <Image source={require('../../assets/launch-logo.png')} style={{ width, height }} resizeMode="contain" />
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <View style={{ width: RING, height: RING, marginTop: SPINNER_OFFSET_Y }}>
          <View style={styles.ring} />
          <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]}>
            <View style={styles.dot} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: RING, height: RING, borderRadius: RING / 2,
    borderWidth: 4, borderColor: colors.blueTint,
  },
  orbit: { position: 'absolute', left: 0, top: 0, width: RING, height: RING },
  dot: {
    position: 'absolute', top: -(DOT / 2) + 2, left: RING / 2 - DOT / 2,
    width: DOT, height: DOT, borderRadius: DOT / 2,
    backgroundColor: colors.blue, borderWidth: 2, borderColor: '#FFFFFF',
  },
});
