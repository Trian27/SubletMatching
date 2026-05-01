import { useEffect } from 'react';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppData } from '@/src/context/app-context';

export default function ListingsScreen() {
  const { listings, loading, usingFallback, favoriteIds, toggleFavorite, refreshListings, authMessage, canWriteListings } =
    useAppData();

  useEffect(() => {
    void refreshListings();
  }, [refreshListings]);

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cc0033" />
          <Text style={styles.loadingText}>Loading listings…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshListings} />}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Available Housing</Text>
              <Text style={styles.subtitle}>{listings.length} listings</Text>
            </View>
            {canWriteListings ? (
              <Link href="/listing/new" asChild>
                <Pressable style={styles.createButton}>
                  <Text style={styles.createButtonText}>+ New</Text>
                </Pressable>
              </Link>
            ) : null}
          </View>

          {usingFallback ? (
            <Text style={styles.warning}>Showing fallback data. Check backend connection.</Text>
          ) : null}
          {authMessage ? <Text style={styles.warning}>{authMessage}</Text> : null}

          {listings.map((listing) => {
            const isFavorited = favoriteIds.has(listing.id);
            return (
              <Link key={listing.id} href={`/listing/${listing.id}`} asChild>
                <Pressable style={styles.card}>
                  <Image
                    source={{ uri: listing.image_url || 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80' }}
                    style={styles.cover}
                  />
                  <View style={styles.cardBody}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <Pressable
                        onPress={() => {
                          void toggleFavorite(listing.id);
                        }}
                        hitSlop={8}
                        style={styles.favoriteChip}>
                        <Text style={isFavorited ? styles.favoriteOn : styles.favoriteOff}>
                          {isFavorited ? '♥' : '♡'}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.meta}>${listing.price}/mo • {listing.beds} bed • {listing.propertyType}</Text>
                    <Text style={styles.meta}>{listing.campus_location || 'Rutgers area'} • {listing.distance} mi</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#334155' },
  content: { padding: 16, gap: 12 },
  header: { marginBottom: 4, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 2 },
  createButton: {
    backgroundColor: '#cc0033',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 7,
  },
  createButtonText: { color: '#fff', fontWeight: '700' },
  warning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderWidth: 1,
    color: '#9a3412',
    borderRadius: 12,
    padding: 10,
    marginBottom: 4,
  },
  card: { borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  cover: { height: 180, width: '100%', backgroundColor: '#e2e8f0' },
  cardBody: { padding: 12, gap: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a', flex: 1 },
  favoriteChip: { paddingHorizontal: 8, paddingVertical: 2 },
  favoriteOn: { color: '#cc0033', fontSize: 22 },
  favoriteOff: { color: '#64748b', fontSize: 22 },
  meta: { color: '#475569', fontSize: 13 },
});
