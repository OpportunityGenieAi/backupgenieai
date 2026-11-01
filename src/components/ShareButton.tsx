import React from 'react';
import { Alert, Pressable, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Scholarship } from '../api/scholarships';

// Public page for a shared scholarship. It shows NO scholarship details, only an "install the app to
// view it" message, so the content can be seen and applied for only inside the app.
const SHARE_BASE_URL = 'https://opportunitygenie.org/s';

export function shareUrl(s: Scholarship): string {
  return `${SHARE_BASE_URL}/${s.id}`;
}

// The shared text deliberately leaves out the scholarship's name and details.
export function buildShareMessage(s: Scholarship): string {
  return [
    '🎓 A scholarship was shared with you on OpportunityGenie AI.',
    '',
    'Install the app to view the details and apply:',
    shareUrl(s),
  ].join('\n');
}

/**
 * Opens the phone's share sheet (WhatsApp, Facebook, Gmail, LinkedIn, Telegram,
 * SMS and any other installed app) with a ready-made message and a link to the scholarship.
 */
export default function ShareButton({ scholarship }: { scholarship: Scholarship }) {
  const onShare = async () => {
    try {
      await Share.share({
        title: 'OpportunityGenie AI',
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
