import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import type { EligibleDestination } from '@tripcraft/types';
import { loadProfile } from '../lib/profileStore';
import { PASSPORT_COUNTRIES, REGIONS } from '../lib/constants';

// ── Service URL ───────────────────────────────────────────────────────────────

function getServiceUrl(): string {
  // In Expo dev, derive from the Metro bundler host so it works on real devices
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:3002`;
}

// ── Visa status color ─────────────────────────────────────────────────────────

function statusColor(status: string): string {
  switch (status) {
    case 'visa-free': return '#16a34a';
    case 'visa-on-arrival': return '#d97706';
    case 'e-visa': return '#2563eb';
    default: return '#dc2626';
  }
}

// ── Destination card ──────────────────────────────────────────────────────────

function DestCard({ item }: { item: EligibleDestination }) {
  return (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.cardImgPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName}>{item.countryName}</Text>
          <Text style={[styles.statusBadge, { color: statusColor(item.visaStatus) }]}>
            {item.visaStatusLabel}
          </Text>
        </View>
        <View style={styles.cardRow}>
          {item.avgTemperature !== null && (
            <Text style={styles.cardMeta}>{item.avgTemperature}°C</Text>
          )}
          {item.estimatedMinCostUsd !== null && (
            <Text style={styles.cardPrice}>From ${item.estimatedMinCostUsd}/day</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const [passports, setPassports] = useState<string[]>([]);
  const [selectedPassport, setSelectedPassport] = useState('MAR');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EligibleDestination[] | null>(null);

  // Pre-fill from saved profile
  useEffect(() => {
    loadProfile().then((p) => {
      if (p.passports.length > 0) {
        setPassports(p.passports.map((pp) => pp.countryCode));
      }
    });
  }, []);

  const addPassport = useCallback(() => {
    if (!selectedPassport || passports.includes(selectedPassport)) return;
    setPassports((prev) => [...prev, selectedPassport]);
  }, [selectedPassport, passports]);

  const removePassport = useCallback((code: string) => {
    setPassports((prev) => prev.filter((p) => p !== code));
  }, []);

  const handleSearch = useCallback(async () => {
    if (passports.length === 0) {
      Alert.alert('No passport selected', 'Please add at least one passport.');
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const q = new URLSearchParams({
        passportCountries: passports.join(','),
        sortBy: 'price',
        ...(region ? { region } : {}),
      });
      const url = `${getServiceUrl()}/v1/destinations/eligible?${q.toString()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`Service returned ${res.status}`);
      const data = (await res.json()) as EligibleDestination[];
      setResults(data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [passports, region]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Passport section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛂 Your Passports</Text>
        <View style={styles.pickerRow}>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedPassport}
              onValueChange={(v) => setSelectedPassport(v)}
              style={styles.picker}
            >
              {PASSPORT_COUNTRIES.map((c) => (
                <Picker.Item
                  key={c.code}
                  label={`${c.name} (${c.code})`}
                  value={c.code}
                  enabled={!passports.includes(c.code)}
                />
              ))}
            </Picker>
          </View>
          <Pressable onPress={addPassport} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
        <View style={styles.pills}>
          {passports.map((code) => {
            const name = PASSPORT_COUNTRIES.find((c) => c.code === code)?.name ?? code;
            return (
              <Pressable key={code} onPress={() => removePassport(code)} style={styles.pill}>
                <Text style={styles.pillText}>{name} ({code}) ×</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Region filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Region</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={region} onValueChange={(v) => setRegion(v)} style={styles.picker}>
            {REGIONS.map((r) => (
              <Picker.Item key={r.value} label={r.label} value={r.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Search button */}
      <Pressable
        onPress={handleSearch}
        disabled={passports.length === 0 || loading}
        style={[styles.searchBtn, (passports.length === 0 || loading) && styles.searchBtnDisabled]}
      >
        <Text style={styles.searchBtnText}>
          {loading ? 'Searching…' : '✈️  Find Eligible Destinations'}
        </Text>
      </Pressable>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#1d4ed8" style={{ marginTop: 32 }} />}

      {/* Results */}
      {results !== null && !loading && (
        <View style={{ marginTop: 24 }}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {results.length > 0 ? 'Eligible Destinations' : 'No Results'}
            </Text>
            {results.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{results.length}</Text>
              </View>
            )}
          </View>
          {results.length === 0 ? (
            <Text style={styles.empty}>No destinations match your criteria. Try removing filters.</Text>
          ) : (
            results.map((item) => <DestCard key={item.id} item={item} />)
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 48 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickerWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  picker: { height: 44 },
  addBtn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pillText: { color: '#1d4ed8', fontSize: 13, fontWeight: '600' },
  searchBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  badge: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  badgeText: { color: '#1d4ed8', fontWeight: '600', fontSize: 13 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24, fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardImg: { width: '100%', height: 140 },
  cardImgPlaceholder: { backgroundColor: '#e2e8f0' },
  cardBody: { padding: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  statusBadge: { fontSize: 12, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#64748b' },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#1d4ed8' },
});
