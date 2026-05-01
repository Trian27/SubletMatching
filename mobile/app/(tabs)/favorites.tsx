import { Link } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '@/src/context/app-context';

export default function FavoritesScreen() {
  const { listings, favoriteIds, toggleFavorite, authMessage } = useAppData();
  const favorites = listings.filter((listing) => favoriteIds.has(listing.id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Saved Listings</Text>
      {authMessage ? <Text style={styles.empty}>{authMessage}</Text> : null}
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet. Tap the heart on a listing.</Text>
      ) : (
        favorites.map((listing) => (
          <Link key={listing.id} href={`/listing/${listing.id}`} asChild>
            <Pressable style={styles.card}>
              <Image
                source={{ uri: listing.image_url || 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80' }}
                style={styles.cover}
              />
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.meta}>${listing.price}/mo • {listing.campus_location || 'Rutgers area'}</Text>
                <Pressable
                  onPress={() => {
                    void toggleFavorite(listing.id);
                  }}>
                  <Text style={styles.remove}>Remove from favorites</Text>
                </Pressable>
              </View>
            </Pressable>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  empty: { color: '#475569', marginTop: 12 },
  card: { borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  cover: { height: 140, width: '100%' },
  body: { padding: 12, gap: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  meta: { fontSize: 13, color: '#475569' },
  remove: { marginTop: 6, color: '#cc0033', fontWeight: '600' },
});
