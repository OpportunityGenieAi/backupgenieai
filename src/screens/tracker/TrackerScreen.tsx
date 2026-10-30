import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useTracker } from '../../context/TrackerContext';
import { FeatureGate } from '../../components/FeatureGate';
import { AdBanner } from '../../components/AdBanner';
import { useShowAdOnFocus } from '../../hooks/useInterstitialAd';

const STATUSES = ['saved', 'applied', 'interview', 'accepted', 'rejected'];

function statusColor(status: string) {
  switch (status) {
    case 'applied': return colors.blue;
    case 'interview': return colors.amber;
    case 'accepted': return colors.green;
    case 'rejected': return colors.red;
    default: return colors.inkSoft;
  }
}

function statusTint(status: string) {
  switch (status) {
    case 'applied': return colors.blueTint;
    case 'interview': return colors.amberTint;
    case 'accepted': return colors.greenTint;
    case 'rejected': return colors.redTint;
    default: return colors.grayTint;
  }
}

export default function TrackerScreen() {
  const { user } = useAuth();
  const tracker = useTracker();
  useShowAdOnFocus();

  useEffect(() => {
    if (user) tracker.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <FeatureGate title="Unlock the Tracker" body="Save scholarships and follow your application status from saved to accepted." />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 100 }}
      data={tracker.entries}
      keyExtractor={(item) => item.scholarship_id}
      ListHeaderComponent={
        <View>
          <View style={styles.headRow}>
            <View style={styles.headIcon}>
              <Ionicons name="list" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Your applications</Text>
              <Text style={styles.heading}>Tracker</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{tracker.entries.length}</Text>
            </View>
          </View>
          <AdBanner />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={24} color={colors.blue} />
          </View>
          <Text style={styles.emptyText}>
            Nothing saved yet. Tap the bookmark icon on any scholarship from Home to track it here.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.row, { borderLeftColor: statusColor(item.status) }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.rowTitle}>{item.scholarship.name}</Text>
            <Text style={styles.rowSub}>{item.scholarship.provider} · {item.scholarship.deadline_window}</Text>
          </View>
          <View style={[styles.pickerWrap, { backgroundColor: statusTint(item.status) }]}>
            <Picker
              selectedValue={item.status}
              style={{ color: statusColor(item.status) }}
              onValueChange={(v) => tracker.updateStatus(item.scholarship_id, v as string)}
              mode="dropdown"
            >
              {STATUSES.map((s) => <Picker.Item key={s} label={s[0].toUpperCase() + s.slice(1)} value={s} />)}
            </Picker>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  headIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  eyebrow: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft },
  heading: { fontFamily: fonts.extraBold, fontSize: 25, color: colors.ink },
  countPill: { backgroundColor: colors.tealTint, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  countText: { fontFamily: fonts.bold, fontSize: 13, color: colors.tealDark },
  emptyBox: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg,
    padding: 22, alignItems: 'center', gap: 12,
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line, borderLeftWidth: 4, padding: 14, marginBottom: 12,
    ...shadow.card,
  },
  rowTitle: { fontFamily: fonts.extraBold, fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, marginTop: 3 },
  pickerWrap: { width: 140, borderRadius: radius.pill, overflow: 'hidden' },
});