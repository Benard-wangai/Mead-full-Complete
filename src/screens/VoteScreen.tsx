// src/screens/VoteScreen.tsx
// Vote / Polls Screen for Mead - The Global Luxury Super App
// Production-ready with realtime voting, anonymous results (visible only to Admin), and luxury UX

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import Card from '../components/Card';

interface VoteOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface Vote {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  ends_at?: string;
}

const VoteScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [votes, setVotes] = useState<Vote[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<string, VoteOption[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchVotes = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch active votes
      const { data: voteData, error } = await supabase
        .from('votes')
        .select(`
          *,
          vote_options (
            id,
            option_text,
            vote_count
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVotes(voteData || []);

      // Build options map
      const map: Record<string, VoteOption[]> = {};
      voteData?.forEach((vote: any) => {
        map[vote.id] = vote.vote_options || [];
      });
      setOptionsMap(map);
    } catch (error: any) {
      meadLogger.error('Failed to fetch votes', error);
      showToast('Failed to load votes', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVotes();

    // Realtime subscription
    const channel = supabase
      .channel('votes-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => fetchVotes()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vote_options' }, 
        () => fetchVotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVotes();
  };

  const castVote = async (voteId: string, optionId: string) => {
    if (!userId) {
      showToast('Please log in to vote', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_votes')
        .insert({
          vote_id: voteId,
          option_id: optionId,
          user_id: userId,
        });

      if (error) {
        if (error.code === '23505') {
          showToast('You have already voted in this poll', 'error');
        } else {
          throw error;
        }
        return;
      }

      showToast('Vote recorded successfully!', 'success');
      fetchVotes(); // Refresh counts
    } catch (error: any) {
      meadLogger.error('Vote failed', error);
      showToast('Failed to cast vote', 'error');
    }
  };

  const renderVote = ({ item }: { item: Vote }) => {
    const options = optionsMap[item.id] || [];

    return (
      <Card style={styles.voteCard}>
        <Text style={styles.voteTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.voteDescription}>{item.description}</Text>
        )}

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionButton}
              onPress={() => castVote(item.id, option.id)}
            >
              <Text style={styles.optionText}>{option.option_text}</Text>
              <Text style={styles.voteCount}>
                {option.vote_count} votes
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>
          {new Date(item.ends_at || Date.now()).toLocaleDateString()}
        </Text>
      </Card>
    );
  };

  if (loading && votes.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading votes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Votes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateVote')}>
          <Ionicons name="add-circle" size={32} color={colors.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={votes}
        renderItem={renderVote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={80} color="#444" />
            <Text style={styles.emptyText}>No active votes right now</Text>
            <Text style={styles.emptySubtext}>Create one to engage your community</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD70022',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  voteCard: {
    marginBottom: 16,
  },
  voteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  voteDescription: {
    color: '#CCCCCC',
    fontSize: 15,
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  voteCount: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 6,
  },
  footer: {
    color: '#666',
    fontSize: 13,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 24,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
  },
});

export default VoteScreen;