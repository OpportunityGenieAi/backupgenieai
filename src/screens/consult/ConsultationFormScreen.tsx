import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { Booking, ConsultationsApi } from '../../api/consultations';

const LEVELS = ['High school', "Bachelor's (undergraduate)", "Master's", 'PhD', 'Other'];

export default function ConsultationFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const id: string = route.params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { emailSent: boolean }>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState(LEVELS[1]);
  const [interest, setInterest] = useState('');
  const [applied, setApplied] = useState('');
  const [academic, setAcademic] = useState('');
  const [availability, setAvailability] = useState('');
  const [notes, setNotes] = useState('');

  const refresh = useCallback(async () => {
    try {
      const rows = await ConsultationsApi.mine();
      setBooking(rows.find((b) => b.id === id) ?? null);
    } catch { /* keep what we have */ }
    setLoading(false);
  }, [id]);

  // Reload when the student comes back from the browser upload page.
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const send = async () => {
    if (!name.trim() || !country.trim() || !interest.trim() || !academic.trim()) {
      Alert.alert('Almost there', 'Please fill in your name, country, what you want to study and your academic background.');
      return;
    }
    setSending(true);
    try {
      const r = await ConsultationsApi.submit(id, {
        full_name: name, email, country, education_level: level, study_interest: interest,
        applied_scholarships: applied, academic_summary: academic, availability, notes,
      });
      setDone({ emailSent: r.email_sent });
    } catch (e: any) {
      Alert.alert('Could not send', String(e?.message ?? 'Please try again.'));
    }
    setSending(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (done || booking?.status === 'submitted') {
    return (
      <View style={s.doneWrap}>
        <View style={s.doneIcon}><Ionicons name="checkmark" size={40} color="#fff" /></View>
        <Text style={s.doneTitle}>You're all set!</Text>
        <Text style={s.doneBody}>
          We've received your details{booking?.files?.length ? ' and documents' : ''}. We'll email your meeting time to {email || 'you'} within 1–2 working days. Please reply to confirm that it suits you.
        </Text>
        <Pressable style={s.btn} onPress={() => navigation.popToTop()}><Text style={s.btnText}>Back to my profile</Text></Pressable>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={s.doneWrap}>
        <Text style={s.doneTitle}>Booking not found</Text>
        <Text style={s.doneBody}>We could not find this booking on your account. If you paid, please contact info@opportunitygenie.org.</Text>
      </View>
    );
  }

  const Field = (label: string, value: string, set: (v: string) => void, extra: any = {}) => (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput style={[s.input, extra.multiline && { minHeight: 90, textAlignVertical: 'top' }]} value={value} onChangeText={set}
        placeholderTextColor={colors.inkFaint} {...extra} />
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 22, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={s.paid}>
          <Ionicons name="checkmark-circle" size={20} color={colors.green} />
          <Text style={s.paidText}>Payment received · {booking.minutes}-minute session</Text>
        </View>
        <Text style={s.intro}>Tell us about yourself so your scholar can prepare. It takes about 3 minutes.</Text>

        <View style={s.card}>
          {Field('Full name', name, setName, { placeholder: 'Your full name' })}
          {Field('Email (we send your meeting time here)', email, setEmail, { keyboardType: 'email-address', autoCapitalize: 'none', placeholder: 'you@example.com' })}
          {Field('Country of origin', country, setCountry, { placeholder: 'e.g. Kenya' })}

          <Text style={s.label}>Current level of education</Text>
          <View style={s.pickerWrap}>
            <Picker selectedValue={level} onValueChange={(v) => setLevel(v as string)}>
              {LEVELS.map((l) => <Picker.Item key={l} label={l} value={l} />)}
            </Picker>
          </View>

          {Field('What do you want to study?', interest, setInterest, { placeholder: 'e.g. MSc Public Health in Europe' })}
          {Field('Scholarships you have applied for so far', applied, setApplied, { multiline: true, placeholder: 'List them, or write "none yet"' })}
          {Field('Your current academic background', academic, setAcademic, { multiline: true, placeholder: 'Degree, university, grades/GPA, English test, work or research experience' })}
          {Field('Your availability for the meeting', availability, setAvailability, { multiline: true, placeholder: 'Days, times and your time zone' })}
          {Field('Anything else you want to discuss? (optional)', notes, setNotes, { multiline: true })}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Documents for review</Text>
          <Text style={s.cardSub}>Statement of purpose, motivation letter, CV or anything else. PDF or Word, up to 3 files.</Text>
          {booking.files.map((f) => (
            <View key={f.id} style={s.file}>
              <Ionicons name="document-attach-outline" size={18} color={colors.blue} />
              <Text style={s.fileName} numberOfLines={1}>{f.filename}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable style={[s.outline, { flex: 1 }]} onPress={() => Linking.openURL(ConsultationsApi.uploadUrl(booking.upload_token))}>
              <Ionicons name="cloud-upload-outline" size={16} color={colors.blue} />
              <Text style={s.outlineText}>{booking.files.length ? 'Add or change' : 'Attach documents'}</Text>
            </Pressable>
            <Pressable style={s.outline} onPress={refresh}>
              <Ionicons name="refresh" size={16} color={colors.blue} />
              <Text style={s.outlineText}>Refresh</Text>
            </Pressable>
          </View>
          <Text style={s.hint}>This opens a secure page in your browser. After uploading, come back here and tap Refresh.</Text>
        </View>

        <Pressable style={[s.btn, sending && { opacity: 0.6 }]} disabled={sending} onPress={send}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Confirm and send</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  paid: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F6EF', borderRadius: radius.md, padding: 12, marginBottom: 12 },
  paidText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  intro: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20, marginBottom: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 16, ...shadow.card },
  cardTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink },
  cardSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 2, marginBottom: 8, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.inkSoft, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  pickerWrap: { backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  fileName: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink, flex: 1 },
  outline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.blue, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 14 },
  outlineText: { fontFamily: fonts.bold, fontSize: 13, color: colors.blue },
  hint: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 10, lineHeight: 16 },
  btn: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', alignSelf: 'stretch' },
  btnText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  doneWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  doneIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontFamily: fonts.extraBold, fontSize: 21, color: colors.ink },
  doneBody: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, marginBottom: 10 },
});
