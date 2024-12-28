import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Strategy } from '../types/strategy';

interface Props {
  visible: boolean;
  onClose: () => void;
  strategy: Strategy;
  onToggle: (id: string) => void;
  onDelete: (strategy: Strategy) => void;
}

export default function StatsModal({ visible, onClose, strategy, onToggle, onDelete }: Props) {
  const winRate = ((strategy.stats.wins / (strategy.stats.totalBets || 1)) * 100).toFixed(1);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{strategy.name}</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <View style={styles.controls}>
            <Pressable
              style={[styles.controlButton, strategy.active ? styles.activeButton : styles.inactiveButton]}
              onPress={() => onToggle(strategy.id)}
            >
              <MaterialIcons 
                name={strategy.active ? "pause" : "play-arrow"} 
                size={20} 
                color={strategy.active ? "#f4511e" : "#4caf50"} 
              />
              <Text style={[
                styles.controlText,
                strategy.active ? styles.activeText : styles.inactiveText
              ]}>
                {strategy.active ? 'Pausar' : 'Ativar'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.controlButton, styles.deleteButton]}
              onPress={() => {
                onClose();
                onDelete(strategy);
              }}
            >
              <MaterialIcons name="delete-outline" size={20} color="#ff4444" />
              <Text style={styles.deleteText}>Excluir</Text>
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{strategy.stats.wins}</Text>
              <Text style={[styles.statLabel, styles.wins]}>Vitórias</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{strategy.stats.losses}</Text>
              <Text style={[styles.statLabel, styles.losses]}>Derrotas</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{winRate}%</Text>
              <Text style={styles.statLabel}>Taxa de Acerto</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{strategy.stats.totalMartingales}</Text>
              <Text style={styles.statLabel}>Martingales</Text>
            </View>
          </View>

          <View style={styles.profitSection}>
            <Text style={styles.sectionTitle}>Resultado Financeiro</Text>
            <Text style={[
              styles.profitValue,
              strategy.stats.profit >= 0 ? styles.profit : styles.loss
            ]}>
              R$ {Math.abs(strategy.stats.profit).toFixed(2)}
              {strategy.stats.profit >= 0 ? ' ✓' : ' ✗'}
            </Text>
          </View>

          <View style={styles.streakSection}>
            <Text style={styles.sectionTitle}>Maiores Sequências</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>Vitórias: </Text>
              <Text style={styles.streakValue}>{strategy.stats.highestStreak.wins}</Text>
            </View>
            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>Derrotas: </Text>
              <Text style={styles.streakValue}>{strategy.stats.highestStreak.losses}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  wins: {
    color: '#4caf50',
  },
  losses: {
    color: '#f44336',
  },
  profitSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  streakSection: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  streakLabel: {
    color: '#666',
  },
  streakValue: {
    fontWeight: '600',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#fff0e8',
    borderColor: '#f4511e20',
  },
  inactiveButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf5020',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
    borderColor: '#ff444420',
  },
  controlText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#f4511e',
  },
  inactiveText: {
    color: '#4caf50',
  },
  deleteText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 14,
  },
}); 