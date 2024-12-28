import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  results: Array<{color: string; number: number}>;
  verifiedResults?: Array<{
    number: number;
    color: string;
    seed: string;
    hash: string;
  }>;
  historySize: number;
}

export default function ResultsHistoryModal({ visible, onClose, results, verifiedResults, historySize }: Props) {
  const getColorStyle = (color: string) => {
    switch (color) {
      case 'red': return styles.red;
      case 'black': return styles.black;
      case 'white': return styles.white;
      default: return {};
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <View style={styles.headerInfo}>
              <Text style={styles.modalTitle}>Histórico</Text>
              <Text style={styles.resultCount}>
                Base para cálculo: {historySize} resultados
                {verifiedResults ? ` (${verifiedResults.length} verificados)` : ''}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Vermelho:</Text>
                <Text style={styles.statValue}>
                  {((results.filter(r => r.color === 'red').length / results.length) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Preto:</Text>
                <Text style={styles.statValue}>
                  {((results.filter(r => r.color === 'black').length / results.length) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Branco:</Text>
                <Text style={styles.statValue}>
                  {((results.filter(r => r.color === 'white').length / results.length) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.resultsGrid}>
              {results.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <View style={[styles.colorIndicator, getColorStyle(result.color)]} />
                  <Text style={styles.number}>{result.number}</Text>
                  <Text style={styles.position}>{index + 1}º</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerInfo: {
    gap: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
    width: '23%',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  number: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  position: {
    fontSize: 12,
    color: '#666',
  },
  red: {
    backgroundColor: '#f44336',
  },
  black: {
    backgroundColor: '#000',
  },
  white: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 