import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/colors';
import { Scholarship } from '../api/scholarships';

const NA = 'Not available';

/** "Bachelor's / Master's / PhD" -> "Undergraduate · Master's · PhD" (display only, data is not changed). */
export function formatLevels(raw?: string | null): string {
  if (!raw || !raw.trim()) return NA;
  const out: string[] = [];
  const add = (v: string) => { if (!out.includes(v)) out.push(v); };
  for (const part of raw.split(/\s*(?:\/|,|&|\||\band\b|\bor\b)\s*/i)) {
    const p = part.trim();
    if (!p) continue;
    const l = p.toLowerCase();
    if (/post.?doc/.test(l)) add('Postdoc');
    else if (/undergrad|bachelor|^bsc\b|^ba\b/.test(l)) add('Undergraduate');
    else if (/phd|doctor|dphil/.test(l)) add('PhD');
    else if (/graduate degree|postgrad/.test(l)) { add("Master's"); add('PhD'); }
    else if (/master|msc|^ma\b/.test(l)) add("Master's");
    else add(p);
  }
  return out.length ? out.join(' · ') : NA;
}

function Cell({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={17} color={colors.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Text style={styles.value} numberOfLines={3}>{value}</Text>
      </View>
    </View>
  );
}

export default function ScholarshipFacts({ scholarship }: { scholarship: Scholarship }) {
  const s = scholarship as Scholarship & { funding_amount?: string | null };
  const clean = (v?: string | null) => (v && v.trim() ? v.trim() : NA);
  return (
    <View style={styles.grid}>
      <Cell icon="school-outline" label="LEVEL" value={formatLevels(s.level)} />
      <Cell icon="cash-outline" label="FUNDING" value={clean(s.funding)} />
      <Cell icon="wallet-outline" label="AMOUNT" value={clean(s.funding_amount)} />
      <Cell icon="calendar-outline" label="DEADLINE" value={clean(s.deadline_window)} />
      <Cell icon="location-outline" label="COUNTRY" value={clean(s.country)} />
      <Cell icon="book-outline" label="FIELD" value={clean(s.field)} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, marginBottom: 16 },
  cell: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingRight: 8 },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.5, color: colors.inkSoft, marginBottom: 2 },
  value: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, lineHeight: 18 },
});
