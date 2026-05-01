import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '@/src/context/app-context';

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listings, isFavorited, toggleFavorite, deleteListing, userId, canWriteListings } = useAppData();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Listing not found</Text>
      </View>
    );
  }

  const favorite = isFavorited(listing.id);
  const canDelete = Boolean(canWriteListings && userId && listing.host_id && listing.host_id === userId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: listing.image_url || 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.cover}
      />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{listing.title}</Text>
          <Pressable
            onPress={() => {
              void toggleFavorite(listing.id);
            }}
            style={styles.favoritePill}>
            <Text style={favorite ? styles.favoriteOn : styles.favoriteOff}>{favorite ? '♥ Saved' : '♡ Save'}</Text>
          </Pressable>
        </View>

        <Text style={styles.price}>${listing.price}/month</Text>
        <Text style={styles.meta}>{listing.beds} bed • {listing.propertyType} • {listing.distance} mi</Text>
        <Text style={styles.meta}>{listing.campus_location || 'Rutgers area'}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description || 'No description provided yet.'}</Text>

        {canDelete ? (
          <Pressable
            onPress={() => {
              void deleteListing(listing.id)
                .then(() => router.replace('/'))
                .catch((error) => {
                  Alert.alert('Delete failed', error instanceof Error ? error.message : 'Could not delete listing.');
                });
            }}
            style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete listing</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  cover: { height: 260, width: '100%' },
  card: {
    marginTop: -24,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', flex: 1 },
  price: { fontSize: 20, fontWeight: '700', color: '#cc0033' },
  meta: { fontSize: 14, color: '#475569' },
  sectionTitle: { marginTop: 8, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  description: { color: '#334155', lineHeight: 21 },
  favoritePill: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  favoriteOn: { color: '#cc0033', fontWeight: '700' },
  favoriteOff: { color: '#64748b', fontWeight: '700' },
  deleteButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteText: { color: '#b91c1c', fontWeight: '700' },
});
