// src/components/GeoTargetSelector.tsx
// Geo Target Selector for Mead - The Global Luxury Super App
// Production-ready with searchable modal, clean luxury UI, and smooth UX

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import Button from './Button';

interface GeoTargetSelectorProps {
  selectedType: 'worldwide' | 'countries' | 'regions';
  // eslint-disable-next-line no-unused-vars
  onTypeChange: (type: 'worldwide' | 'countries' | 'regions') => void;
  selectedTargets: string[];
  // eslint-disable-next-line no-unused-vars
  onTargetsChange: (targets: string[]) => void;
}

const COUNTRIES = [
  'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania',
  'Rwanda', 'Ethiopia', 'Egypt', 'Morocco', 'United States', 'United Kingdom',
  'Canada', 'Germany', 'France', 'India', 'Brazil', 'UAE', 'Saudi Arabia',
  'Australia', 'Japan', 'China', 'Mexico', 'Turkey', 'Italy', 'Spain',
  'Netherlands', 'Sweden', 'Norway', 'Switzerland', 'Singapore', 'Malaysia',
];

const REGIONS = [
  'East Africa', 'West Africa', 'Southern Africa', 'North Africa',
  'Middle East', 'Europe', 'North America', 'South America', 'Asia',
  'Southeast Asia', 'Caribbean', 'Pacific Islands',
];

const GeoTargetSelector: React.FC<GeoTargetSelectorProps> = ({
  selectedType,
  onTypeChange,
  selectedTargets,
  onTargetsChange,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableItems = useMemo(() => {
    return selectedType === 'countries' ? COUNTRIES : REGIONS;
  }, [selectedType]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return availableItems;
    const query = searchQuery.toLowerCase();
    return availableItems.filter(item => 
      item.toLowerCase().includes(query)
    );
  }, [availableItems, searchQuery]);

  const toggleTarget = (target: string) => {
    if (selectedTargets.includes(target)) {
      onTargetsChange(selectedTargets.filter(t => t !== target));
    } else {
      onTargetsChange([...selectedTargets, target]);
    }
  };

  const selectAll = () => onTargetsChange([...availableItems]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Target Audience</Text>
      <Text style={styles.subtitle}>Who should see your content?</Text>

      {/* Type Selection */}
      <View style={styles.typeSelector}>
        {(['worldwide', 'countries', 'regions'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
            onPress={() => {
              onTypeChange(type);
              if (type === 'worldwide') onTargetsChange([]);
            }}
          >
            <Text style={[
              styles.typeText,
              selectedType === type && styles.typeTextActive,
            ]}>
              {type === 'worldwide' && '🌍 Worldwide'}
              {type === 'countries' && '🏳️ Countries'}
              {type === 'regions' && '📍 Regions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Targets */}
      {selectedType !== 'worldwide' && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>
            Selected {selectedType === 'countries' ? 'Countries' : 'Regions'} ({selectedTargets.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {selectedTargets.map((target, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{target}</Text>
                <TouchableOpacity onPress={() => toggleTarget(target)} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#FFD700" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#000" />
            <Text style={styles.addButtonText}>
              Add {selectedType === 'countries' ? 'Countries' : 'Regions'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.black }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectedType === 'countries' ? 'Countries' : 'Regions'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#FFD700" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedTargets.includes(item) && styles.listItemSelected,
                  ]}
                  onPress={() => toggleTarget(item)}
                >
                  <Text style={styles.listItemText}>{item}</Text>
                  {selectedTargets.includes(item) && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                  )}
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalFooter}>
              <Button title="Select All" onPress={selectAll} style={styles.footerButton} />
              <Button title="Done" onPress={() => setModalVisible(false)} style={styles.footerButton} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: '#FFD700',
  },
  typeText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeTextActive: {
    color: '#000000',
  },
  selectedContainer: {
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 10,
  },
  chipsScroll: {
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70022',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipText: {
    color: '#FFD700',
    marginRight: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listItemSelected: {
    backgroundColor: '#FFD70022',
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  footerButton: {
    flex: 1,
  },
});

export default GeoTargetSelector;