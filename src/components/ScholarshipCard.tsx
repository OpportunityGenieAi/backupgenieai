import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../theme/colors';
import { Scholarship } from '../api/scholarships';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import ShareButton from './ShareButton';

function matchColor(tier?: string | null): string {
  if (tier === 'green') return colors.green;
  if (tier === 'yellow') return colors.amber;
  if (tier === 'red') return colors.red;
  return colors.blue;
}

function matchTint(tier?: string | null): string {
  if (tier === 'green') return colors.greenTint;
  if (tier === 'yellow') return colors.amberTint;
  if (tier === 'red') return colors.redTint;
  return colors.blueTint;
}

export function ScholarshipCard({
  scholarship, isBookmarked, showMatch, onToggleBookmark,
}: {
  scholarship: Scholarship;
  isBookmarked?: boolean;
  showMatch?: boolean;
  onToggleBookmark?: () => void;
}) {
  const { showIfFirstTimeThisSession } = useInterstitialAd();

  const handleApply = () => {
    showIfFirstTimeThisSession(); // fires at most once per app session; no-op otherwise
    Linking.openURL(scholarship.official_link);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{scholarship.name}</Text>
          <Text style={styles.provider}>{scholarship.provider}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 10 }}>
          {showMatch && scholarship.match_score != null && (
            <View style={[styles.matchPill, { backgroundColor: matchTint(scholarship.match_tier) }]}>
              <Text style={[styles.matchPct, { color: matchColor(scholarship.match_tier) }]}>
                {scholarship.match_score}%
              </Text>
            </View>
          )}
          <Pressable
            onPress={onToggleBookmark}
            style={[styles.bookmarkBtn, isBookmarked && { backgroundColor: colors.blue, borderColor: colors.blue }]}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={isBookmarked ? '#fff' : colors.inkSoft}
            />
          </Pressable>
        </View>
      </View>

      <Text style={styles.blurb}>{scholarship.blurb}</Text>

      <View style={styles.metaPanel}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.blue} />
          <Text style={styles.metaText}>{scholarship.country}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={14} color={colors.teal} />
          <Text style={styles.metaText}>{scholarship.funding}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.amber} />
          <Text style={styles.metaText}>{scholarship.deadline_window}</Text>
        </View>
      </View>

      {scholarship.tags?.length > 0 && (
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    marginBottom: 16,
    ...shadow.card,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, marginBottom: 3, lineHeight: 23 },
  provider: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft },
  matchPill: { borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5 },
  matchPct: { fontFamily: fonts.extraBold, fontSize: 14 },
  bookmarkBtn: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.line,
    backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center',
  },
  blurb: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, marginTop: 10, marginBottom: 14, lineHeight: 21 },
  metaPanel: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: colors.blueTint, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.blue },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  applyBtn: {
    flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.blue, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
});