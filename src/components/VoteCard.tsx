// src/components/VoteCard.tsx
// Luxury Vote Card for Mead - Legal & Transparent Voting System
// Used in Groups, Polls, Elections, and Decision Making with clear legal disclaimer

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';

interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface VoteCardProps {
  pollId: string;
  question: string;
  options: VoteOption[];
  totalVotes: number;
  hasVoted?: boolean;
  userVoteId?: string;
  // eslint-disable-next-line no-unused-vars
  onVote: (optionId: string) => void;
  legalDisclaimer?: string;
  endDate?: string;
}

const VoteCard: React.FC<VoteCardProps> = ({
  question,
  options,
  totalVotes,
  hasVoted = false,
  userVoteId,
  onVote,
  legalDisclaimer = "All votes are anonymous and final. Results are updated in real-time.",
  endDate,
}) => {
  const { colors } = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(userVoteId || null);
  const [hasSubmitted, setHasSubmitted] = useState(hasVoted);

  const handleVote = (optionId: string) => {
    tap();

    if (hasSubmitted) {
      Alert.alert("Vote Already Cast", "You have already voted in this poll. Votes are final.");
      return;
    }

    setSelectedOption(optionId);

    Alert.alert(
      "Confirm Your Vote",
      `Are you sure you want to vote for "${options.find(o => o.id === optionId)?.text}"?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel", onPress: () => setSelectedOption(null) },
        {
          text: "Confirm Vote",
          onPress: () => {
            successTap();
            onVote(optionId);
            setHasSubmitted(true);
            
            Alert.alert(
              "Vote Recorded",
              "Thank you for voting. Your vote has been counted anonymously.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const getPercentage = (votes: number): number => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.dark }]}>
      <Text style={[styles.question, { color: colors.white }]}>
        {question}
      </Text>

      {endDate && (
        <Text style={[styles.endDate, { color: colors.gray }]}>
          Voting ends: {endDate}
        </Text>
      )}

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOption === option.id || (hasSubmitted && userVoteId === option.id);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
              ]}
              onPress={() => handleVote(option.id)}
              disabled={hasSubmitted}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, { color: isSelected ? colors.black : colors.white }]}>
                  {option.text}
                </Text>
                <Text style={[styles.percentage, { color: isSelected ? colors.black : colors.gold }]}>
                  {percentage}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: isSelected ? colors.black : colors.gold 
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.disclaimer, { color: colors.gray }]}>
        {legalDisclaimer}
      </Text>

      {hasSubmitted && (
        <Text style={[styles.thankYou, { color: colors.emerald }]}>
          ✓ Thank you for voting
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD70044',
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 26,
  },
  endDate: {
    fontSize: 13,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD70022',
  },
  selectedOption: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  thankYou: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default VoteCard;