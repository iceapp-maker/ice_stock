import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { supabase, Stock } from '@/lib/supabase';

export default function StockFilter() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = ['科技', '金融', '製造', '電信', '能源'];

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stocks')
        .select('*')
        .order('code');

      if (fetchError) throw fetchError;

      setStocks(data || []);
      setFilteredStocks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入股票資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleFilter = () => {
    let filtered = [...stocks];

    if (minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((stock) => stock.price >= min);
      }
    }

    if (maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((stock) => stock.price <= max);
      }
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((stock) =>
        selectedCategories.includes(stock.category)
      );
    }

    setFilteredStocks(filtered);
  };

  const resetFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategories([]);
    setFilteredStocks(stocks);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStocks}>
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>股票篩選器</Text>
        <Text style={styles.headerSubtitle}>
          找到 {filteredStocks.length} 支股票
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>股價範圍</Text>
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.inputLabel}>最低價</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                keyboardType="decimal-pad"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <Text style={styles.priceSeparator}>-</Text>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.inputLabel}>最高價</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="9999"
                keyboardType="decimal-pad"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>股票類別</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category) &&
                    styles.categoryChipSelected,
                ]}
                onPress={() => toggleCategory(category)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category) &&
                      styles.categoryChipTextSelected,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.filterButton]}
            onPress={handleFilter}>
            <Text style={styles.filterButtonText}>套用篩選</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetFilter}>
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>股票列表</Text>
          {filteredStocks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>沒有符合條件的股票</Text>
            </View>
          ) : (
            <View style={styles.stockList}>
              {filteredStocks.map((stock) => (
                <View key={stock.id} style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <View>
                      <Text style={styles.stockCode}>{stock.code}</Text>
                      <Text style={styles.stockName}>{stock.name}</Text>
                    </View>
                    <View style={styles.stockRight}>
                      <Text style={styles.stockPrice}>
                        ${stock.price.toFixed(2)}
                      </Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {stock.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
  },
  content: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  priceSeparator: {
    fontSize: 20,
    color: '#9ca3af',
    marginHorizontal: 12,
    marginTop: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  categoryChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#10b981',
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resetButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    padding: 16,
  },
  stockList: {
    gap: 12,
  },
  stockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  stockName: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
