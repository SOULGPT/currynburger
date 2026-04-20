import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { createOrder } from '@/lib/supabase';
import { useWaiterOrderStore } from '@/features/waiter/stores/waiterOrder.store';
import { getCurrentUser } from '@/lib/supabase';

export default function OrderConfirmationScreen() {
  const {
    tableId,
    roomId,
    items,
    type,
    notes,
    totalAmount,
    removeItem,
    setOrderNotes,
    clearOrder,
  } = useWaiterOrderStore();

  const [loading, setLoading] = useState(false);
  const [orderNotes, setLocalOrderNotes] = useState(notes);

  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId);
  };

  const handleSendOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Errore', 'Aggiungi almeno un articolo all\'ordine');
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const currentUser = await getCurrentUser();

      // Prepare order items
      const orderItems = items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customizations: item.customizations,
        notes: item.notes,
      }));

      // Create order
      await createOrder({
        userId: currentUser.$id,
        items: orderItems,
        tableId: tableId || undefined,
        roomId: roomId || undefined,
        type: type === 'dinein' ? 'dinein' : 'pickup',
        source: 'waiter',
        notes: orderNotes,
        totalAmount,
      });

      // Clear store
      setOrderNotes('');
      clearOrder();

      // Show success and navigate back
      Alert.alert('✓ Ordine Confermato', 'L\'ordine è stato inviato in cucina', [
        {
          text: 'OK',
          onPress: () => {
            router.dismiss(2);  // Close both confirmation and browser screens
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile inviare l\'ordine');
    } finally {
      setLoading(false);
    }
  };

  if (!tableId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Errore: Nessun tavolo selezionato</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Indietro</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Conferma Ordine</Text>
        <View style={styles.spacer} />
      </View>

      {/* Order Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tavolo:</Text>
          <Text style={styles.infoValue}>
            {tableId === 'ASPORTO' ? 'Asporto' : `Tavolo #${tableId}`}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo Servizio:</Text>
          <Text style={styles.infoValue}>
            {type === 'dinein' ? '🪑 Al Tavolo' : '🥡 Asporto'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Articoli:</Text>
          <Text style={styles.infoValue}>{items.length}</Text>
        </View>
      </View>

      {/* Order Items */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Articoli Ordinati</Text>

        {items.map((item, index) => (
          <View key={`${item.menuItemId}-${index}`} style={styles.itemCard}>
            {/* Item Header */}
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.menuItemId)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Customizations */}
            {Object.keys(item.customizations).length > 0 && (
              <View style={styles.customizationsBox}>
                {Object.entries(item.customizations).map(([key, value]) => (
                  <Text key={key} style={styles.customizationText}>
                    • {key}: {value}
                  </Text>
                ))}
              </View>
            )}

            {/* Notes */}
            {item.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>Nota: {item.notes}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Order Notes */}
        <View style={styles.orderNotesSection}>
          <Text style={styles.sectionTitle}>Note Ordine (Opzionale)</Text>
          <TextInput
            style={styles.orderNotesInput}
            placeholder="Es: Consegna veloce, ordine principale..."
            placeholderTextColor="#9CA3AF"
            value={orderNotes}
            onChangeText={setLocalOrderNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Total & Buttons */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTALE</Text>
          <Text style={styles.totalAmount}>€{totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annulla</Text>
          </Pressable>

          <Pressable
            style={[
              styles.confirmButton,
              loading ? styles.confirmButtonDisabled : undefined,
            ]}
            onPress={handleSendOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Invia in Cucina</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  spacer: {
    width: 40,
  },
  infoCard: {
    backgroundColor: '#F0F4FF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 12,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#EF4444',
  },
  customizationsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  customizationText: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 1,
  },
  notesBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
  },
  notesText: {
    fontSize: 12,
    color: '#92400E',
  },
  orderNotesSection: {
    marginBottom: 20,
  },
  orderNotesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
