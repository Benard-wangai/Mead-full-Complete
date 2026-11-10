// src/screens/GroupDetailScreen.tsx
// Group Detail Screen for Mead - The Global Luxury Super App
// Production-ready with realtime, proper Supabase joins, and fixed Button style error

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/Button';

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  member_count: number;
  is_private: boolean;
  is_mega: boolean;
  created_by: string;
}

interface GroupMember {
  user_id: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

const GroupDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { groupId } = route.params || {};

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!groupId) {
      navigation.goBack();
      return;
    }

    let channel: any = null;

    const fetchGroup = async () => {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        const { data: membership } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();

        setIsMember(!!membership);
        setIsAdmin(groupData.created_by === user.id);

        fetchMembers();
      } catch (error: any) {
        meadLogger.error('Failed to load group', error);
        showToast('Failed to load group details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();

    channel = supabase
      .channel(`group:${groupId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${groupId}` },
        (payload) => setGroup(payload.new as Group)
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .limit(20);

      const formatted = (data || []).map((item: any) => ({
        user_id: item.user_id,
        profile: {
          full_name: item.profiles?.full_name || 'Unknown',
          avatar_url: item.profiles?.avatar_url || null,
        },
      }));

      setMembers(formatted);
    } catch (e) {
      meadLogger.error('Failed to fetch members', e);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: user.id });

      if (error) throw error;

      setIsMember(true);
      fetchMembers();
      showToast('Successfully joined the group!', 'success');
    } catch (error: any) {
      showToast('Failed to join group', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', user.id);

              setIsMember(false);
              fetchMembers();
              showToast('You have left the group', 'success');
            } catch (e) {
              showToast('Failed to leave group', 'error');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading group...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <Text style={styles.errorText}>Group not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header Image */}
      <View style={styles.header}>
        {group.avatar_url ? (
          <Image source={{ uri: group.avatar_url }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, { backgroundColor: '#1A1A1A' }]}>
            <Ionicons name="people" size={80} color={colors.gold} />
          </View>
        )}

        <View style={styles.headerOverlay}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>
            {group.member_count?.toLocaleString() || 0} members
            {group.is_mega && ' • MEGA GROUP'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {group.is_mega && (
          <View style={styles.megaBadge}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.megaText}>MEGA GROUP • Up to 10 Million Members</Text>
          </View>
        )}

        <Text style={styles.description}>{group.description}</Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isMember ? (
            <>
              <Button
                title="Enter Group Chat"
                onPress={() => navigation.navigate('ChatThread', {
                  conversationId: group.id,
                  participantName: group.name,
                })}
                style={styles.primaryButton}
              />
              <Button
                title="Leave Group"
                onPress={handleLeaveGroup}
                style={styles.leaveButton}   // Fixed: Single style object
              />
            </>
          ) : (
            <Button
              title="Join Group"
              onPress={handleJoinGroup}
              style={styles.primaryButton}
            />
          )}
        </View>

        {/* Members Preview */}
        <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        <FlatList
          horizontal
          data={members.slice(0, 10)}
          keyExtractor={(item) => item.user_id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Image
                source={{ uri: item.profile.avatar_url || 'https://picsum.photos/id/64/60' }}
                style={styles.memberAvatar}
              />
              <Text style={styles.memberName} numberOfLines={1}>
                {item.profile.full_name}
              </Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 260, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 20,
  },
  groupName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberCount: {
    color: '#FFD700',
    fontSize: 15,
    marginTop: 4,
  },
  content: { padding: 20 },
  megaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70022',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  megaText: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: { flex: 1 },
  leaveButton: { 
    flex: 1, 
    backgroundColor: '#FF3B30' 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 16,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#FFFFFF', marginTop: 16 },
  errorText: { color: '#FF6B6B', fontSize: 18 },
});

export default GroupDetailScreen;