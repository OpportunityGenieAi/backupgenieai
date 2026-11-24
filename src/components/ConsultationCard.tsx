import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../theme/colors';
import { Booking, ConsultationsApi } from '../api/consultations';

export default function ConsultationCard() {
  const navigation = useNavigation<any>();
  const [waiting, setWaiting] = useState<Booking | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      ConsultationsApi.mine()
        .then((rows) => { if (alive) setWaiting(rows.find((b) => b.status === 'paid') ?? null); })
        .catch(() => {});
      return () => { alive = false; };
    }, []),
  );

  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={s.avatar}><Ionicons name="school" size={26} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Talk to a Scholar</Text>
          <Text style={s.sub}>One-to-one scholarship guidance</Text>
        </View>
      </View>

      <View style={s.panel}>
        <Ionicons name="ribbon-outline" size={16} color={colors.blue} />
        <Text style={s.panelText}>Scholarship recipient: <Text style={s.panelBold}>Erasmus Mundus</Text></Text>
      </View>

      <Text style={s.body}>
        Get personal advice on choosing scholarships, shaping your application and strengthening your statement of purpose.
      </Text>

      <View style={s.chips}>
        <View style={s.chip}><Text style={s.chipText}>30 min · $8</Text></View>
        <View style={s.chip}><Text style={s.chipText}>1 hour · $15</Text></View>
      </View>

      {waiting && (
        <Pressable style={s.banner} onPress={() => navigation.navigate('ConsultationForm', { id: waiting.id })}>
          <Ionicons name="checkmark-circle" size={18} color={colors.green} />
          <Text style={s.bannerText}>Your {waiting.minutes}-minute session is paid. Tap to finish your details.</Text>
        </Pressable>
      )}

      <Pressable style={({ pressed }) => [s.btn, pressed && { opacity: 0.9 }]} onPress={() => navigation.navigate('Consultation')}>
        <Ionicons name="calendar-outline" size={17} color="#fff" />
        <Text style={s.btnText}>Book Consultation</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 20, marginBottom: 16, ...shadow.card },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 1 },
  panel: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.blueTint, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
  panelText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink, flex: 1 },
  panelBold: { fontFamily: fonts.bold, color: colors.blue },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, lineHeight: 19, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: colors.bg },
  chipText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F6EF', borderRadius: radius.md, padding: 12, marginBottom: 12 },
  bannerText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink, flex: 1 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 14 },
  btnText: { fontFamily: fonts.bold, fontSize: 14.5, color: '#fff' },
});
