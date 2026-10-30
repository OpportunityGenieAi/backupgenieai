import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { useTracker } from '../../context/TrackerContext';
import { FeatureGate } from '../../components/FeatureGate';

const LEVELS = ['Undergraduate', "Master's", 'PhD', 'Postdoc'];
const LEADERSHIP = ['None', 'Some', 'Extensive'];
const VOLUNTEERING = ['None', 'Occasional', 'Regular'];

function CardHeader({ icon, title, sub }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string }) {
  return (
    <View style={styles.cardHead}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={18} color={colors.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {!!sub && <Text style={styles.cardSub}>{sub}</Text>}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const profile = useProfile();
  const tracker = useTracker();

  const [level, setLevel] = useState("Master's");
  const [field, setField] = useState('');
  const [nationality, setNationality] = useState('');
  const [ielts, setIelts] = useState('');
  const [workYears, setWorkYears] = useState('0');
  const [publications, setPublications] = useState('0');
  const [leadership, setLeadership] = useState('None');
  const [volunteering, setVolunteering] = useState('None');
  const [hasCv, setHasCv] = useState(false);
  const [hasSop, setHasSop] = useState(false);
  const [hasRecs, setHasRecs] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await profile.loadAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const ap = profile.academicProfile;
    if (ap) {
      setLevel(ap.level); setField(ap.field); setNationality(ap.nationality);
      setIelts(ap.ielts != null ? String(ap.ielts) : '');
      setWorkYears(String(ap.work_years)); setPublications(String(ap.publications));
      setLeadership(ap.leadership); setVolunteering(ap.volunteering);
      setHasCv(ap.has_cv); setHasSop(ap.has_sop); setHasRecs(ap.has_recommendation_letters);
    }
  }, [profile.academicProfile]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <FeatureGate title="Create your profile" body="Save your GPA and academic details to power match scores and the AI advisor." />
      </View>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await profile.saveAcademic({
        level, field: field.trim(), nationality: nationality.trim(),
        ielts: ielts ? parseFloat(ielts) : null,
        work_years: parseInt(workYears, 10) || 0,
        publications: parseInt(publications, 10) || 0,
        leadership, volunteering,
        has_cv: hasCv, has_sop: hasSop, has_recommendation_letters: hasRecs,
      });
    } catch {
      // silently ignore for now — could surface a toast
    }
    setSaving(false);
  };

  const doLogout = async () => {
    await logout();
    profile.reset();
    tracker.reset();
  };

  const switchProps = {
    trackColor: { false: colors.line, true: colors.teal },
    thumbColor: '#fff',
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 100 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.heroBtns}>
          {user.is_admin && (
            <Pressable style={styles.heroBtn} onPress={() => navigation.navigate('Admin')}>
              <Ionicons name="shield-checkmark-outline" size={15} color="#fff" />
              <Text style={styles.heroBtnText}>Admin console</Text>
            </Pressable>
          )}
          <Pressable style={styles.heroBtn} onPress={doLogout}>
            <Ionicons name="log-out-outline" size={15} color="#fff" />
            <Text style={styles.heroBtnText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      {/* Academic standing */}
      <View style={styles.card}>
        <CardHeader icon="school-outline" title="Academic standing" sub="From the GPA Converter." />
        {profile.gpaProfile ? (
          <>
            <View style={styles.gpaRow}>
              <Text style={styles.bigGpa}>{profile.gpaProfile.gpa.toFixed(2)}</Text>
              <Text style={styles.gpaMeta}>
                Unified GPA · {profile.gpaProfile.percent.toFixed(0)}% US-equivalent · ECTS {profile.gpaProfile.ects}
              </Text>
            </View>
            <Pressable style={[styles.outlineBtn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={() => navigation.navigate('GpaConverter')}>
              <Text style={styles.outlineBtnText}>Update my grade</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.emptyBox}><Text style={styles.emptyText}>You haven't converted a grade yet.</Text></View>
            <Pressable style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => navigation.navigate('GpaConverter')}>
              <Text style={styles.primaryBtnText}>Open GPA Converter</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Details */}
      <View style={styles.card}>
        <CardHeader icon="create-outline" title="Your details" sub="Used to score how well each scholarship fits you." />

        <Text style={styles.label}>Degree level seeking</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={level} onValueChange={(v) => setLevel(v as string)}>
            {LEVELS.map((l) => <Picker.Item key={l} label={l} value={l} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Field of study</Text>
        <TextInput style={styles.input} value={field} onChangeText={setField} placeholder="e.g. Public health" placeholderTextColor={colors.inkFaint} />

        <Text style={styles.label}>Nationality</Text>
        <TextInput style={styles.input} value={nationality} onChangeText={setNationality} placeholder="e.g. Kenya" placeholderTextColor={colors.inkFaint} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>IELTS score</Text>
            <TextInput style={styles.input} value={ielts} onChangeText={setIelts} keyboardType="decimal-pad" placeholder="e.g. 7.0" placeholderTextColor={colors.inkFaint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Work years</Text>
            <TextInput style={styles.input} value={workYears} onChangeText={setWorkYears} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.label}>Publications</Text>
        <TextInput style={styles.input} value={publications} onChangeText={setPublications} keyboardType="number-pad" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Leadership</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={leadership} onValueChange={(v) => setLeadership(v as string)}>
                {LEADERSHIP.map((l) => <Picker.Item key={l} label={l} value={l} />)}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Volunteering</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={volunteering} onValueChange={(v) => setVolunteering(v as string)}>
                {VOLUNTEERING.map((l) => <Picker.Item key={l} label={l} value={l} />)}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Switch value={hasCv} onValueChange={setHasCv} {...switchProps} />
          <Text style={styles.switchLabel}>I have a CV/resume ready</Text>
        </View>
        <View style={styles.switchRow}>
          <Switch value={hasSop} onValueChange={setHasSop} {...switchProps} />
          <Text style={styles.switchLabel}>I have a Statement of Purpose ready</Text>
        </View>
        <View style={styles.switchRow}>
          <Switch value={hasRecs} onValueChange={setHasRecs} {...switchProps} />
          <Text style={styles.switchLabel}>I have reference/recommendation letters ready</Text>
        </View>

        <Pressable style={[styles.primaryBtn, { marginTop: 18 }]} onPress={saveProfile} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save profile'}</Text>
        </Pressable>
      </View>

      {/* Readiness */}
      <View style={styles.card}>
        <CardHeader icon="speedometer-outline" title="Scholarship Readiness Score" sub="Like a credit score for your scholarship applications." />
        {!profile.readiness ? (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>Save your GPA and details above to see your readiness score.</Text></View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <Text style={styles.readinessOverall}>{profile.readiness.overall}</Text>
              <Text style={styles.readinessOutOf}>/ 100</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, Number(profile.readiness.overall)))}%` }]} />
            </View>
            {profile.readiness.categories.map((c) => (
              <View key={c.label} style={styles.readinessRow}>
                <Text style={styles.readinessLabel}>{c.label}</Text>
                <Text style={styles.readinessStars}>{'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Premium */}
      <View style={styles.premium}>
        <View style={styles.premiumIcon}>
          <Ionicons name="diamond-outline" size={20} color="#fff" />
        </View>
        <Text style={styles.premiumTitle}>OpportunityGenie Premium</Text>
        <Text style={styles.premiumSub}>Get scholarships matched to you, statement of purpose review and motivation letter feedback.</Text>
        <Pressable style={({ pressed }) => [styles.premiumBtn, pressed && { opacity: 0.9 }]} onPress={() => navigation.navigate('Upgrade')}>
          <Text style={styles.premiumBtnText}>Upgrade to Premium</Text>
        </Pressable>
      </View>

      {/* Legal */}
      <View style={styles.card}>
        <CardHeader icon="document-text-outline" title="Legal" />
        <Pressable
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://opportunitygenie.org/static/privacy-policy.html')}
        >
          <Text style={styles.linkRowText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.blue} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.blue, borderRadius: radius.xl, padding: 22, marginBottom: 16,
    alignItems: 'center', ...shadow.card,
  },
  bigAvatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  bigAvatarText: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.blue },
  userName: { fontFamily: fonts.extraBold, fontSize: 19, color: '#fff' },
  userEmail: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  heroBtns: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill,
    paddingVertical: 9, paddingHorizontal: 16,
  },
  heroBtnText: { fontFamily: fonts.bold, fontSize: 13, color: '#fff' },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line,
    padding: 20, marginBottom: 16, ...shadow.card,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontFamily: fonts.extraBold, fontSize: 15.5, color: colors.ink },
  cardSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 1 },

  gpaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  bigGpa: { fontFamily: fonts.extraBold, fontSize: 30, color: colors.blue },
  gpaMeta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, flex: 1 },

  emptyBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 14 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },

  primaryBtn: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.blue, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 16 },
  outlineBtnText: { fontFamily: fonts.bold, fontSize: 13, color: colors.blue },

  label: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.inkSoft, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.ink,
  },
  pickerWrap: { backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  switchLabel: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink, flex: 1 },

  readinessOverall: { fontFamily: fonts.extraBold, fontSize: 36, color: colors.blue },
  readinessOutOf: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.pill, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.teal },
  readinessRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  readinessLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  readinessStars: { color: colors.amber, letterSpacing: 1 },

  premium: {
    backgroundColor: colors.navy, borderRadius: radius.lg, padding: 22, marginBottom: 16, ...shadow.card,
  },
  premiumIcon: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.teal,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  premiumTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: '#fff', marginBottom: 4 },
  premiumSub: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 19, marginBottom: 16 },
  premiumBtn: { backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
  premiumBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },

  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  linkRowText: { fontFamily: fonts.bold, fontSize: 14, color: colors.blue },
});