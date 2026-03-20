import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import {
  loadProfile,
  saveProfile,
  addPassport,
  removePassport,
  addVisa,
  removeVisa,
  type LocalProfile,
} from '../lib/profileStore';
import { PASSPORT_COUNTRIES, DESTINATION_COUNTRIES, VISA_TYPES } from '../lib/constants';

// ── Passport section ──────────────────────────────────────────────────────────

function PassportSection({
  profile,
  onUpdate,
}: {
  profile: LocalProfile;
  onUpdate: (p: LocalProfile) => void;
}) {
  const [selectedCountry, setSelectedCountry] = useState('MAR');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleAdd = useCallback(() => {
    const next = addPassport(profile, { countryCode: selectedCountry, expiryDate: null, isPrimary });
    if (next === profile) {
      Alert.alert(
        profile.passports.length >= 3 ? 'Limit reached' : 'Already added',
        profile.passports.length >= 3
          ? 'You can save up to 3 passports.'
          : 'That passport is already in your profile.',
      );
      return;
    }
    onUpdate(next);
  }, [profile, selectedCountry, isPrimary, onUpdate]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🛂 Passports</Text>
      <Text style={styles.sectionHint}>Up to 3 passports. Tap a saved passport to remove it.</Text>

      <View style={styles.pickerRow}>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedCountry}
            onValueChange={(v) => setSelectedCountry(v)}
            style={styles.picker}
          >
            {PASSPORT_COUNTRIES.map((c) => (
              <Picker.Item
                key={c.code}
                label={`${c.name} (${c.code})`}
                value={c.code}
                enabled={!profile.passports.some((p) => p.countryCode === c.code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Set as primary passport</Text>
        <Switch
          value={isPrimary}
          onValueChange={setIsPrimary}
          trackColor={{ true: '#1d4ed8' }}
        />
      </View>

      <Pressable
        onPress={handleAdd}
        disabled={profile.passports.length >= 3}
        style={[styles.addBtn, profile.passports.length >= 3 && styles.addBtnDisabled]}
      >
        <Text style={styles.addBtnText}>+ Add Passport</Text>
      </Pressable>

      {profile.passports.length > 0 && (
        <View style={styles.pills}>
          {profile.passports.map((p) => {
            const name = PASSPORT_COUNTRIES.find((c) => c.code === p.countryCode)?.name ?? p.countryCode;
            return (
              <Pressable
                key={p.id}
                onPress={() => onUpdate(removePassport(profile, p.id))}
                style={[styles.pill, p.isPrimary && styles.pillPrimary]}
              >
                <Text style={[styles.pillText, p.isPrimary && styles.pillTextPrimary]}>
                  {name} ({p.countryCode}){p.isPrimary ? ' ★' : ''} ×
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── Visa section ──────────────────────────────────────────────────────────────

function VisaSection({
  profile,
  onUpdate,
}: {
  profile: LocalProfile;
  onUpdate: (p: LocalProfile) => void;
}) {
  const [destCountry, setDestCountry] = useState('FR');
  const [visaType, setVisaType] = useState('schengen');

  const handleAdd = useCallback(() => {
    const next = addVisa(profile, { destinationCountry: destCountry, visaType, expiryDate: null });
    if (next === profile) {
      Alert.alert('Already added', 'You already have a visa for that destination.');
      return;
    }
    onUpdate(next);
  }, [profile, destCountry, visaType, onUpdate]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Held Visas</Text>
      <Text style={styles.sectionHint}>
        Add visas you already hold (e.g. a Schengen visa opens many European destinations).
      </Text>

      <Text style={styles.label}>Destination country</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={destCountry} onValueChange={(v) => setDestCountry(v)} style={styles.picker}>
          {DESTINATION_COUNTRIES.map((c) => (
            <Picker.Item key={c.code} label={c.name} value={c.code} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { marginTop: 10 }]}>Visa type</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={visaType} onValueChange={(v) => setVisaType(v)} style={styles.picker}>
          {VISA_TYPES.map((vt) => (
            <Picker.Item key={vt.value} label={vt.label} value={vt.value} />
          ))}
        </Picker>
      </View>

      <Pressable onPress={handleAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add Visa</Text>
      </Pressable>

      {profile.visas.length > 0 && (
        <View style={styles.pills}>
          {profile.visas.map((v) => {
            const name = DESTINATION_COUNTRIES.find((c) => c.code === v.destinationCountry)?.name ?? v.destinationCountry;
            const typeLabel = VISA_TYPES.find((vt) => vt.value === v.visaType)?.label ?? v.visaType;
            return (
              <Pressable
                key={v.id}
                onPress={() => onUpdate(removeVisa(profile, v.id))}
                style={styles.pill}
              >
                <Text style={styles.pillText}>{name} · {typeLabel} ×</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const [profile, setProfile] = useState<LocalProfile>({
    passports: [],
    visas: [],
    departureCountry: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  const handleUpdate = useCallback((next: LocalProfile) => {
    setProfile(next);
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    await saveProfile(profile);
    setSaved(true);
  }, [profile]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Your Profile</Text>
      <Text style={styles.pageSubtitle}>
        Saved locally on this device. No account needed.
      </Text>

      <PassportSection profile={profile} onUpdate={handleUpdate} />
      <VisaSection profile={profile} onUpdate={handleUpdate} />

      {/* Departure country */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Departure Country</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={profile.departureCountry}
            onValueChange={(v) => handleUpdate({ ...profile, departureCountry: v })}
            style={styles.picker}
          >
            <Picker.Item label="Not set" value="" />
            {DESTINATION_COUNTRIES.map((c) => (
              <Picker.Item key={c.code} label={c.name} value={c.code} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Save button */}
      <Pressable onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save Profile'}</Text>
      </Pressable>

      {/* CTA */}
      {profile.passports.length > 0 && (
        <Link href="/search" asChild>
          <Pressable style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>✈️  Find Eligible Destinations</Text>
          </Pressable>
        </Link>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 48 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, color: '#0f172a' },
  sectionHint: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: { fontSize: 13, color: '#374151' },
  addBtn: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  pill: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pillPrimary: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  pillText: { color: '#1d4ed8', fontSize: 13, fontWeight: '600' },
  pillTextPrimary: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
