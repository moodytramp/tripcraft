import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from '@tripcraft/i18n';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.appName')}</Text>
      <Text style={styles.subtitle}>Smart Travel Planning</Text>
      <Text style={styles.description}>
        Destinations, Flights & Hotels in One Place
      </Text>

      <View style={styles.actions}>
        <Link href="/search" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {t('search.findDestinations')}
            </Text>
          </Pressable>
        </Link>

        <Link href="/profile" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              {t('profile.title')}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#334155',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 48,
  },
  actions: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d4ed8',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: '600',
  },
});
