import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { colors, fonts } from '../../theme/colors';
import { Scholarship, ScholarshipsApi } from '../../api/scholarships';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';
import ShareButton from '../../components/ShareButton';

/**
 * Opens when someone taps a shared link (https://opportunitygenie.org/s/<id>).
 * This is where the official application link is used: applying happens only inside the app.
 */
export default function ScholarshipDetailScreen() {
  const route = useRoute<any>();
  const id: string | undefined = route.params?.id;
  const { showIfFirstTimeThisSession } = useInterstitialAd();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setFailed(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      setScholarship(await ScholarshipsApi.get(id));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = () => {
    if (!scholarship) return;
    showIfFirstTimeThisSession(); // fires at most once per app session; no-op otherwise
    Linking.openURL(scholarship.official_link);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  if (failed || !scholarship) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>We couldn't load this scholarship</Text>
        <Text style={styles.errorSub}>It may have been removed, or your connection dropped.</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{scholarship.name}</Text>
        <Text style={styles.provider}>{scholarship.provider}</Text>

        <Text style={styles.blurb}>{scholarship.blurb}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.inkSoft} />
            <Text style={styles.metaText}>{scholarship.country}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={13} color={colors.inkSoft} />
            <Text style={styles.metaText}>{scholarship.funding}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.inkSoft} />
            <Text style={styles.metaText}>{scholarship.deadline_window}</Text>
          </View>
        </View>

        {scholarship.tags && scholarship.tags.length > 0 && (
          <View style={styles.tagRow}>
            {scholarship.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Apply on official site</Text>
          </Pressable>
          <ShareButton scholarship={scholarship} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  errorSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: colors.blue, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 22 },
  retryBtnText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
  card: {
    backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18,
  },
  title: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink, marginBottom: 2 },
  provider: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  blurb: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, marginTop: 10, marginBottom: 14, lineHeight: 21 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  tag: { backgroundColor: colors.blueTint, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4 },
  tagText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.blue },
  actionRow: { flexDirection: 'row', gap: 10 },
  applyBtn: { flex: 1, backgroundColor: colors.blue, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  applyBtnText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
});
