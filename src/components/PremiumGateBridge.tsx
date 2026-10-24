import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PremiumGate } from '../api/premiumGate';

export default function PremiumGateBridge() {
  const navigation = useNavigation<any>();

  useEffect(
    () =>
      PremiumGate.subscribe(() => {
        Alert.alert('Premium feature', 'This feature is part of OpportunityGenie Premium.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') },
        ]);
      }),
    [navigation]
  );

  return null;
}
