import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getMenu, getCategories, getMenuItemCustomizations } from '@/lib/supabase';
import { useWaiterOrderStore, OrderLineItem } from '@/features/waiter/stores/waiterOrder.store';

interface MenuItemRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
}

interface CategoryRow {
  $id: string;
  id: string;
  name: string;
}

export default function OrderBrowserScreen() {
  const { tableId, isTakeaway } = useLocalSearchParams<{ tableId: string; isTakeaway?: string }>();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItemRow | null>(null);
  const [customizationModalVisible, setCustomizationModalVisible] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [itemCustomizations, setItemCustomizations] = useState<Record<string, string>>({});
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([]);

  const { items, totalAmount, addItem, removeItem } = useWaiterOrderStore();

  // Load categories and menu
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, menuData] = await Promise.all([
          getCategories(),
          getMenu({}),
        ]);

        const mappedCategories = categoriesData.map((cat: any) => ({
          $id: cat.$id || cat.id,
          id: cat.id,
          name: cat.name,
        }));

        setCategories(mappedCategories);
        
        // Map MenuItem to MenuItemRow (add id if missing)
        const mappedMenuItems = (menuData as any[]).map((item: any) => ({
          ...item,
          id: item.id || item.$id,
        })) as MenuItemRow[];
        
        setMenuItems(mappedMenuItems);

        // Set first category as default
        if (mappedCategories.length > 0) {
          setSelectedCategory(mappedCategories[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectItem = async (item: MenuItemRow) => {
    setSelectedItem(item);

    // Load customizations for this item
    try {
      const customizations = await getMenuItemCustomizations(item.id);
      setCustomizationOptions(customizations);
    } catch (err) {
      console.error('Failed to load customizations:', err);
    }

    setItemQuantity(1);
    setItemNotes('');
    setItemCustomizations({});
    setCustomizationModalVisible(true);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;

    const lineItem: OrderLineItem = {
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: itemQuantity,
      customizations: itemCustomizations,
      notes: itemNotes,
    };

    addItem(lineItem);
    setCustomizationModalVisible(false);

    // Show brief confirmation
    alert(`✓ ${selectedItem.name} aggiunto all'ordine`);
  };

  const getVisibleMenuItems = () => {
    let filtered: MenuItemRow[] = menuItems;

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Caricamento menu...</Text>
      </View>
    );
  }

  const visibleItems = getVisibleMenuItems();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Indietro</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isTakeaway === 'true' ? 'Ordine Asporto' : `Tavolo #${tableId}`}
        </Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{items.length}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Menu Items */}
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.menuItemCard}
            onPress={() => handleSelectItem(item)}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              )}
            </View>
            <Text style={styles.menuItemPrice}>€{item.price.toFixed(2)}</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.menuList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun articolo trovato</Text>
          </View>
        }
      />

      {/* Order Summary Footer */}
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.orderSummary}>
            <Text style={styles.summaryLabel}>Totale:</Text>
            <Text style={styles.summaryTotal}>€{totalAmount.toFixed(2)}</Text>
          </View>
          <Pressable
            style={styles.confirmButton}
            onPress={() => {
              router.push({
                pathname: '/(waiter)/order-confirmation',
              });
            }}
          >
            <Text style={styles.confirmButtonText}>Conferma Ordine</Text>
          </Pressable>
        </View>
      )}

      {/* Customization Modal */}
      <Modal
        visible={customizationModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setCustomizationModalVisible(false)}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Price */}
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Prezzo:</Text>
                <Text style={styles.priceValue}>€{selectedItem?.price.toFixed(2)}</Text>
              </View>

              {/* Quantity */}
              <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>Quantità</Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{itemQuantity}</Text>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => setItemQuantity(itemQuantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Customizations */}
              {customizationOptions.length > 0 && (
                <View style={styles.customizationsSection}>
                  <Text style={styles.sectionTitle}>Personalizzazioni</Text>
                  {customizationOptions.map((option) => (
                    <View key={option.id} style={styles.customizationOption}>
                      <Text style={styles.customizationLabel}>{option.name}</Text>
                      <Text style={styles.customizationPrice}>
                        +€{option.extra_price?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Notes */}
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Note / Istruzioni</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Es: Senza cipolla, piccante, ben cotto..."
                  placeholderTextColor="#9CA3AF"
                  value={itemNotes}
                  onChangeText={setItemNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setCustomizationModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Annulla</Text>
              </Pressable>
              <Pressable
                style={styles.modalAddButton}
                onPress={handleAddItem}
              >
                <Text style={styles.modalAddButtonText}>
                  Aggiungi - €{(selectedItem?.price || 0 * itemQuantity).toFixed(2)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
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
  cartBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesScroll: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  menuList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
    padding: 8,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  quantitySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: 100,
  },
  quantityButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  quantityValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  customizationsSection: {
    marginBottom: 16,
  },
  customizationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customizationLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  customizationPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
