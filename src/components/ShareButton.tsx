import React from 'react';
import { Alert, Pressable, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Scholarship } from '../api/scholarships';

// Public page for a scholarship. It shows a summary and an "Open in the app" / "Get it on Google Play"
// button, but never the official application link: applying happens only inside the app.
const SHARE_BASE_URL = 'https://opportunitygenie.org/s';

export function shareUrl(s: Scholarship): string {
  return `${SHARE_BASE_URL}/${s.id}`;
}

export function buildShareMessage(s: Scholarship): string {
  const lines = [
    `🎓 ${s.name}`,
    s.provider ? `By ${s.provider}` : '',
    s.country ? `📍 ${s.country}` : '',
    s.funding ? `💰 ${s.funding}` : '',
    s.deadline_window ? `⏰ Deadline: ${s.deadline_window}` : '',
    '',
    'See the details and apply in the OpportunityGenie AI app:',
    shareUrl(s),
  ];
  return lines
    .filter((line, i, arr) => !(line === '' && (i === 0 || arr[i - 1] === '' || i === arr.length - 1)))
    .join('\n')
    .trim();
}

/**
 * Opens the phone's share sheet (WhatsApp, Facebook, Gmail, LinkedIn, Telegram,
 * SMS and any other installed app) with a ready-made message and a link to the scholarship.
 */
export default function ShareButton({ scholarship }: { scholarship: Scholarship }) {
  const onShare = async () => {
    try {
      await Share.share({
        title: scholarship.name,
        message: buildShareMessage(scholarship),
      });
    } catch {
      Alert.alert('Could not open sharing', 'Please try again.');
    }
  };

  return (
    <Pressable
      onPress={onShare}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Share ${scholarship.name}`}
      style={styles.btn}
    >
      <Ionicons name="share-social-outline" size={20} color={colors.blue} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.blue,
    backgroundColor: '#fff',
  },
});
