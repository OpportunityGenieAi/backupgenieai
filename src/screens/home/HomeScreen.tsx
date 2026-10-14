import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useScholarships } from '../../context/ScholarshipContext';
import { useTracker } from '../../context/TrackerContext';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { AdBanner } from '../../components/AdBanner';

const REGIONS = ['All', 'UK', 'USA', 'Europe', 'Africa', 'Asia', 'Other'];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const scholarships = useScholarships();
  const tracker = useTracker();

  useEffect(() => {
    scholarships.fetch(!!user);
    if (user) tracker.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSearch = (text: string) => {
    scholarships.setQuery(text);
  };

  useEffect(() => {
    const t = setTimeout(() => scholarships.fetch(!!user), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarships.query, scholarships.region]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Sticky header: stays in place while only the scholarship cards scroll */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.eyebrow}>Explore Scholarships</Text>
            <Text style={styles.heading} numberOfLines={1} adjustsFontSizeToFit>Find Your Scholarship</Text>
          </View>
          {user ? (
            <Pressable style={styles.avatar} onPress={() => navigation.navigate('ProfileTab')}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Latest Scholarships</Text>
        <Text style={styles.sectionSub}>{scholarships.items.length} opportunities worldwide</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={colors.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scholarships, countries…"
            value={scholarships.query}
            onChangeText={onSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {REGIONS.map((r) => {
            const active = scholarships.region === r;
            return (
              <Pressable
                key={r}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => scholarships.setRegion(r)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Only this list scrolls */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        data={scholarships.items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {!user && (
              <Pressable style={styles.ctaBanner} onPress={() => navigation.navigate('Signup')}>
                <View style={styles.ctaIcon}><Ionicons name="lock-open-outline" size={19} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ctaTitle}>Create a free account</Text>
                  <Text style={styles.ctaSub}>Unlock Match scores, Tracker, Advisor & more</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            )}
            {scholarships.loading && <ActivityIndicator style={{ marginVertical: 20 }} color={colors.blue} />}
            <AdBanner />
          </View>
        }
        renderItem={({ item }) => (
          <ScholarshipCard
            scholarship={item}
            showMatch={!!user}
            isBookmarked={tracker.isTracked(item.id)}
            onToggleBookmark={() => {
              if (!user) { navigation.navigate('Signup'); return; }
              tracker.toggle(item.id);
            }}
          />
        )}
        ListEmptyComponent={!scholarships.loading ? (
          <Text style={styles.empty}>No scholarships match those filters yet.</Text>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  eyebrow: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  heading: { fontFamily: fonts.extraBold, fontSize: 25, color: colors.ink },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.blue },
  loginBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  ctaBanner: { backgroundColor: colors.blue, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  ctaIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  ctaTitle: { fontFamily: fonts.extraBold, fontSize: 15.5, color: '#fff', marginBottom: 2 },
  ctaSub: { fontFamily: fonts.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink },
  sectionSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.pill, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 10 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.pill, marginRight: 8 },
  chipActive: { backgroundColor: colors.blue },
  chipText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.blue },
  chipTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.inkSoft, fontFamily: fonts.regular, fontSize: 13.5, paddingVertical: 40 },
});