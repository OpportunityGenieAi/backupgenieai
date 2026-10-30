import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useScholarships } from '../../context/ScholarshipContext';
import { useTracker } from '../../context/TrackerContext';
import { ScholarshipCard } from '../../components/ScholarshipCard';
import { AdBanner } from '../../components/AdBanner';

const REGIONS = ['All', 'UK', 'USA', 'Europe', 'Africa', 'Asia', 'Other'];

// Banner after these list positions (0-based: 4 = after the 5th scholarship). Value = reload stagger in ms.
const MID_ADS: Record<number, number> = { 4: 20000, 9: 40000 };

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
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

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {focused && <StatusBar style="light" />}

      {/* Sticky header: stays in place while only the scholarship cards scroll */}
      <View>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.eyebrow}>{user ? `Hi, ${firstName} 👋` : 'Welcome 👋'}</Text>
              <Text style={styles.heading} numberOfLines={1} adjustsFontSizeToFit>Find Your Scholarship</Text>
            </View>
            {user ? (
              <Pressable style={styles.avatar} onPress={() => navigation.navigate('ProfileTab')}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                <Ionicons name="log-in-outline" size={21} color={colors.blue} />
              </Pressable>
            )}
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.blue} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search scholarships, countries…"
              placeholderTextColor={colors.inkSoft}
              value={scholarships.query}
              onChangeText={onSearch}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0 }}
          contentContainerStyle={styles.chipRow}
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 100 }}
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

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Latest Scholarships</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{scholarships.items.length}</Text>
              </View>
            </View>

            {scholarships.loading && <ActivityIndicator style={{ marginVertical: 20 }} color={colors.blue} />}
            <AdBanner />
          </View>
        }
        renderItem={({ item, index }) => (
          <View>
            <ScholarshipCard
              scholarship={item}
              showMatch={!!user}
              isBookmarked={tracker.isTracked(item.id)}
              onToggleBookmark={() => {
                if (!user) { navigation.navigate('Signup'); return; }
                tracker.toggle(item.id);
              }}
            />
            {MID_ADS[index] !== undefined ? <AdBanner offsetMs={MID_ADS[index]} /> : null}
          </View>
        )}
        ListEmptyComponent={!scholarships.loading ? (
          <Text style={styles.empty}>No scholarships match those filters yet.</Text>
        ) : null}
        ListFooterComponent={scholarships.items.length > 0 ? <AdBanner offsetMs={60000} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 13.5, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  heading: { fontFamily: fonts.extraBold, fontSize: 25, color: '#fff' },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.blue },
  loginBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff',
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 13,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink, padding: 0 },
  chipRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: radius.pill,
    backgroundColor: colors.pill, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.blue, ...shadow.card },
  chipText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.inkSoft },
  chipTextActive: { color: '#fff' },
  ctaBanner: {
    backgroundColor: colors.navy, borderRadius: radius.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
    ...shadow.card,
  },
  ctaIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontFamily: fonts.extraBold, fontSize: 15.5, color: '#fff', marginBottom: 2 },
  ctaSub: { fontFamily: fonts.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.75)' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink },
  countPill: { backgroundColor: colors.tealTint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.tealDark },
  empty: { textAlign: 'center', color: colors.inkSoft, fontFamily: fonts.regular, fontSize: 13.5, paddingVertical: 40 },
});