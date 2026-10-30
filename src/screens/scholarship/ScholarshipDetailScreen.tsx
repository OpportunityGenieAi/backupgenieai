import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../../theme/colors';
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
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={26} color={colors.blue} />
        </View>
        <Text style={styles.errorTitle}>We couldn't load this scholarship</Text>
        <Text style={styles.errorSub}>It may have been removed, or your connection dropped.</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{scholarship.name}</Text>
        <Text style={styles.heroProvider}>{scholarship.provider}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>About this scholarship</Text>
        <Text style={styles.blurb}>{scholarship.blurb}</Text>

        <View style={styles.metaPanel}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={15} color={colors.blue} />
            <Text style={styles.metaText}>{scholarship.country}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={15} color={colors.teal} />
            <Text style={styles.metaText}>{scholarship.funding}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={colors.amber} />
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
          <Pressable style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.88 }]} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Apply on official site</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
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
  errorIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  errorTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  errorSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: 18 },
  retryBtn: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 26 },
  retryBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  hero: {
    backgroundColor: colors.blue, borderRadius: radius.xl, padding: 22, marginBottom: 16,
    ...shadow.card,
  },
  heroTitle: { fontFamily: fonts.extraBold, fontSize: 21, color: '#fff', lineHeight: 28, marginBottom: 6 },
  heroProvider: { fontFamily: fonts.medium, fontSize: 13.5, color: 'rgba(255,255,255,0.82)' },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line,
    padding: 20, ...shadow.card,
  },
  sectionLabel: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  blurb: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, marginBottom: 16, lineHeight: 22 },
  metaPanel: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14, backgroundColor: colors.bg,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  tag: { backgroundColor: colors.blueTint, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.blue },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  applyBtn: {
    flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.blue, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
});