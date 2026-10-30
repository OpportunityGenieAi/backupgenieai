import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { useScholarships } from '../../context/ScholarshipContext';
import { useTracker } from '../../context/TrackerContext';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { FeatureGate } from '../../components/FeatureGate';
import { AdBanner } from '../../components/AdBanner';
import { useShowAdOnFocus } from '../../hooks/useInterstitialAd';

function ScreenHeading({ sub }: { sub: string }) {
  return (
    <View style={styles.headRow}>
      <View style={styles.headIcon}>
        <Ionicons name="flash" size={22} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>Best Matches</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
    </View>
  );
}

export default function MatchScreen() {
  const { user } = useAuth();
  const profile = useProfile();
  const scholarships = useScholarships();
  const tracker = useTracker();
  useShowAdOnFocus();

  useEffect(() => {
    if (user) scholarships.fetch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <FeatureGate
          title="Unlock Match scores"
          body="See a live match percentage on every scholarship, based on your real GPA and profile."
        />
      </View>
    );
  }

  if (!profile.isComplete) {
    return (
      <View style={styles.container}>
        <ScreenHeading sub="Ranked by fit to your profile" />
        <AdBanner />
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons name="person-circle-outline" size={26} color={colors.blue} />
          </View>
          <Text style={styles.emptyText}>
            Complete your profile (GPA + academic details) on the Profile tab to see match scores here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 100 }}
      data={scholarships.sortedByMatch()}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <ScreenHeading sub="Ranked by fit to your saved profile" />
          <AdBanner />
        </View>
      }
      renderItem={({ item }) => (
        <ScholarshipCard
          scholarship={item}
          showMatch
          isBookmarked={tracker.isTracked(item.id)}
          onToggleBookmark={() => tracker.toggle(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22, paddingTop: 18 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  headIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontFamily: fonts.extraBold, fontSize: 25, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  emptyBox: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg,
    padding: 20, marginTop: 8, alignItems: 'center', gap: 12,
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },
});