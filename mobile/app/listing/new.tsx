import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppData } from '@/src/context/app-context';

const campusOptions = ['Busch', 'College Ave', 'Livingston', 'Cook/Douglass'] as const;

export default function NewListingScreen() {
  const router = useRouter();
  const { createListing } = useAppData();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('1');
  const [campus, setCampus] = useState<(typeof campusOptions)[number]>('College Ave');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async () => {
    setErrorMessage('');

    const priceMonthly = Number(price);
    const bedsCount = Number(beds);
    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }
    if (!Number.isFinite(priceMonthly) || priceMonthly <= 0) {
      setErrorMessage('Price must be a positive number.');
      return;
    }
    if (!Number.isFinite(bedsCount) || bedsCount < 0) {
      setErrorMessage('Beds must be 0 or greater.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createListing({
        title: title.trim(),
        description: description.trim() || null,
        price_monthly: priceMonthly,
        campus_location: campus,
        beds: bedsCount,
        property_type: propertyType.trim() || 'Apartment',
        distance: 0.5,
        image_url: imageUrl.trim() || null,
        amenities: {},
      });
      router.replace(`/listing/${created.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Listing</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Spacious room near Rutgers buses"
          style={styles.input}
        />

        <Text style={styles.label}>Price per month</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="1200"
          style={styles.input}
        />

        <Text style={styles.label}>Beds</Text>
        <TextInput
          value={beds}
          onChangeText={setBeds}
          keyboardType="numeric"
          placeholder="1"
          style={styles.input}
        />

        <Text style={styles.label}>Campus</Text>
        <View style={styles.campusRow}>
          {campusOptions.map((option) => {
            const selected = campus === option;
            return (
              <Pressable
                key={option}
                onPress={() => setCampus(option)}
                style={[styles.campusPill, selected ? styles.campusPillSelected : null]}>
                <Text style={selected ? styles.campusPillTextSelected : styles.campusPillText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Property type</Text>
        <TextInput
          value={propertyType}
          onChangeText={setPropertyType}
          placeholder="Apartment"
          style={styles.input}
        />

        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Share details renters should know"
          style={[styles.input, styles.multiline]}
          multiline
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable onPress={() => void submit()} style={styles.submitButton} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Saving…' : 'Create listing'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12, paddingBottom: 30 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 8 },
  label: { color: '#475569', fontSize: 13, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  campusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  campusPill: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  campusPillSelected: {
    borderColor: '#cc0033',
    backgroundColor: '#ffe4ea',
  },
  campusPillText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  campusPillTextSelected: { color: '#9f1239', fontSize: 12, fontWeight: '700' },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#cc0033',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  submitText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b91c1c', marginTop: 4 },
});
