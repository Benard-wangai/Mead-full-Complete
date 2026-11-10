// src/components/CountryCodePicker.tsx
// Country Code Picker for Mead - The Global Luxury Super App
// Production-ready, searchable, with full country list and luxury black/gold design

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';

interface Country {
  code: string;      // e.g. '+254'
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  // Africa
  { code: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', name: 'Congo (DRC)', flag: '🇨🇩' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: '+218', name: 'Libya', flag: '🇱🇾' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },

  // Asia & Middle East
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
  { code: '+673', name: 'Brunei', flag: '🇧🇳' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', name: 'Maldives', flag: '🇲🇻' },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+963', name: 'Syria', flag: '🇸🇾' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', name: 'Yemen', flag: '🇾🇪' },

  // Europe
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+372', name: 'Estonia', flag: '🇪🇪' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+354', name: 'Iceland', flag: '🇮🇸' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+371', name: 'Latvia', flag: '🇱🇻' },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+356', name: 'Malta', flag: '🇲🇹' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },

  // Americas & Oceania
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
];

interface CountryCodePickerProps {
  selectedCode: string;
  // eslint-disable-next-line no-unused-vars
  onCodeChange: (dialCode: string) => void;
  visible?: boolean;
  onClose?: () => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCode,
  onCodeChange,
  visible: controlledVisible,
  onClose: controlledOnClose,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [internalVisible, setInternalVisible] = useState(false);

  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : internalVisible;

  const closeModal = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalVisible(false);
    }
  };

  const openModal = () => {
    if (!isControlled) {
      setInternalVisible(true);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.includes(query)
    );
  }, [searchQuery]);


  const handleSelect = (country: Country) => {
    onCodeChange(country.code);
    closeModal();
    setSearchQuery('');
  };

  return (
    <>
      {!isControlled && (
        <TouchableOpacity style={styles.trigger} onPress={openModal}>
          <Text style={styles.triggerText}>{selectedCode}</Text>
          <Ionicons name="chevron-down" size={16} color="#FFD700" />
        </TouchableOpacity>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.black }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Country Code</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} color={colors.gold} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryRow,
                  selectedCode === item.code && styles.selectedRow,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.dialCode}>{item.code}</Text>
                {selectedCode === item.code && (
                  <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No matching countries found</Text>
            )}
          />
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingRight: 4,
  },
  triggerText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD70022',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  selectedRow: {
    backgroundColor: '#FFD70022',
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
    width: 36,
  },
  countryName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
  },
  dialCode: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 60,
    fontSize: 16,
  },
});

export default CountryCodePicker;