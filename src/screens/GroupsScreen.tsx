// src/screens/GroupsScreen.tsx
// Groups Screen for Mead - The Global Luxury Super App
// Browse, join, and manage communities with Supabase real-time support

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { supabase } from '../utils/supabaseClient';
import { meadLogger } from '../utils/logger';
import Card from '../components/Card';

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
  image_url?: string;
  is_private: boolean;
  category: string;
  is_joined: boolean;
}

const GroupsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [groups, setGroups] = useState<Group[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch groups from Supabase
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id)
        `)
        .order('member_count', { ascending: false });

      if (error) throw error;

      const formattedGroups = (data || []).map(group => ({
        ...group,
        is_joined: group.group_members?.some((m: any) => m.user_id === user?.id) || false,
      }));

      setGroups(formattedGroups);
    } catch (error) {
      meadLogger.error('Failed to fetch groups', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, is_joined: true, member_count: group.member_count + 1 } 
          : group
      ));

      Alert.alert('Success', 'You have joined the group!');
    } catch (error: any) {
      meadLogger.error('Failed to join group', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <Card style={styles.groupCard}>
      <View style={styles.groupHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.groupImage} />
        ) : (
          <View style={[styles.groupImage, { backgroundColor: '#FFD70033' }]}>
            <Ionicons name="people" size={32} color={colors.gold} />
          </View>
        )}

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.memberCount}>
            {item.member_count.toLocaleString()} members
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          item.is_joined && styles.joinedButton,
        ]}
        onPress={() => {
          if (item.is_joined) {
            navigation.navigate('GroupDetail', { groupId: item.id });
          } else {
            handleJoinGroup(item.id);
          }
        }}
      >
        <Text style={styles.joinButtonText}>
          {item.is_joined ? 'Enter Group' : 'Join Group'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.gold }]}>Communities</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
          <Ionicons name="add-circle" size={32} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroup}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#444" />
            <Text style={styles.emptyText}>No communities found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  memberCount: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: '#333',
  },
  joinButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default GroupsScreen;