import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert, Modal, Animated } from 'react-native';
import { Strategy } from '../types/strategy';
import { MaterialIcons } from '@expo/vector-icons';
import SettingsModal from './SettingsModal';
import { useState, useRef, useEffect } from 'react';
import StrategyForm from './StrategyForm';
import StatsModal from './StatsModal';
import SupportModal from './SupportModal';

interface PotentialStrategy {
  strategy: Strategy;
  missingColor: string;
  confidence: number;
}

interface WaitingStrategy {
  id: string;
  targetColor: string;
  initialAmount: number;
  currentMultiplier: number;
  remainingTries: number;
}

interface Props {
  strategies: Strategy[];
  lastResults: Array<{color: string; number: number}>;
  potentialStrategies: PotentialStrategy[];
  onToggleStrategy: (id: string) => void;
  onShowWebView: () => void;
  showWebView: boolean;
  settings: {
    historySize: number;
    confidenceWindow: number;
  };
  onUpdateSettings: (settings: { historySize: number; confidenceWindow: number }) => void;
  onSaveStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
  onDeleteStrategy: (id: string) => void;
  waitingStrategies: WaitingStrategy[];
}

export default function AnalyticsPanel({
  strategies,
  lastResults,
  potentialStrategies,
  onToggleStrategy,
  onShowWebView,
  showWebView,
  settings,
  onUpdateSettings,
  onSaveStrategy,
  onDeleteStrategy,
  waitingStrategies,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const pulseConfidence = (confidence: number) => {
    if (confidence > 50) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    potentialStrategies.forEach(potential => {
      pulseConfidence(potential.confidence);
    });
  }, [potentialStrategies]);

  const getWinRate = (color: string) => {
    const total = lastResults.length;
    if (total === 0) return 0;
    const wins = lastResults.filter(r => r.color === color).length;
    return ((wins / total) * 100).toFixed(1);
  };

  const handleDelete = (strategy: Strategy) => {
    Alert.alert(
      'Excluir Estratégia',
      `Tem certeza que deseja excluir a estratégia "${strategy.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => onDeleteStrategy(strategy.id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const totalProfit = strategies.reduce((sum, strategy) => sum + strategy.stats.profit, 0);

  const getColorStyle = (color: string) => {
    switch (color) {
      case 'red': return styles.red;
      case 'black': return styles.black;
      case 'white': return styles.white;
      default: return {};
    }
  };

  const handleToggleStrategy = async (id: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const strategy = strategies.find(s => s.id === id);
    if (!strategy) return;

    // Anima o botão
    Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(0.8), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });

    onToggleStrategy(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="analytics" size={24} color="#f4511e" />
            <Text style={styles.title}>Bet Stats</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowSettings(true)}
            >
              <MaterialIcons name="settings" size={24} color="#666" />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowSupport(true)}
            >
              <MaterialIcons name="favorite" size={24} color="#f4511e" />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <View style={styles.profitBadge}>
            <Text style={styles.profitLabel}>Resultado Total:</Text>
            <Text style={[
              styles.profitValue,
              totalProfit >= 0 ? styles.profit : styles.loss
            ]}>
              R$ {Math.abs(totalProfit).toFixed(2)}
            </Text>
          </View>

          <Pressable
            style={[styles.toggleButton, showWebView && styles.toggleButtonActive]}
            onPress={onShowWebView}
          >
            <MaterialIcons 
              name={showWebView ? "visibility-off" : "visibility"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.toggleButtonText}>
              {showWebView ? 'Ocultar Site' : 'Mostrar Site'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Resultados</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.colorIndicator, styles.red]} />
              <Text style={styles.statText}>Vermelho: {getWinRate('red')}%</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.colorIndicator, styles.black]} />
              <Text style={styles.statText}>Preto: {getWinRate('black')}%</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.colorIndicator, styles.white]} />
              <Text style={styles.statText}>Branco: {getWinRate('white')}%</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.resultsContainer}>
              {lastResults.slice(0, settings.historySize).map((result, index) => (
                <View key={index} style={styles.resultWrapper}>
                  <View
                    style={[styles.resultBox, styles[result.color as 'red' | 'black' | 'white']]}
                  >
                    <Text style={[
                      styles.resultText,
                      result.color === 'white' && styles.whiteText
                    ]}>
                      {result.number}
                    </Text>
                  </View>
                  <Text style={styles.resultIndex}>{index + 1}º</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {potentialStrategies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Possíveis Estratégias</Text>
              <MaterialIcons name="notifications-active" size={20} color="#f4511e" />
            </View>
            {potentialStrategies.map((potential, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.potentialItem,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: potential.confidence > 50 ? '#fff0e8' : '#fff3ef',
                  },
                ]}
              >
                <Pressable
                  style={styles.potentialInfo}
                  onPress={() => Alert.alert(
                    'Detalhes da Estratégia',
                    `Estratégia: ${potential.strategy.name}\nAguardando: ${potential.missingColor}\nChance de acerto: ${potential.confidence.toFixed(1)}%`
                  )}
                >
                  <Text style={styles.potentialName}>{potential.strategy.name}</Text>
                  <View style={styles.potentialPattern}>
                    {potential.strategy.pattern.map((p, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.colorBox,
                          styles[p.color],
                          idx === potential.strategy.pattern.length - 1 && styles.nextColor
                        ]}
                      />
                    ))}
                  </View>
                </Pressable>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceText}>
                    {potential.confidence.toFixed(1)}%
                  </Text>
                  <Text style={styles.confidenceLabel}>chance</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {waitingStrategies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Apostas em Andamento</Text>
              <MaterialIcons name="timer" size={20} color="#f4511e" />
            </View>
            {waitingStrategies.map((waiting, index) => {
              const strategy = strategies.find(s => s.id === waiting.id);
              if (!strategy) return null;

              return (
                <View key={index} style={styles.waitingItem}>
                  <View style={styles.waitingInfo}>
                    <Text style={styles.waitingName}>{strategy.name}</Text>
                    <View style={styles.waitingDetails}>
                      <View style={styles.betInfo}>
                        <Text style={styles.betLabel}>Apostando:</Text>
                        <View style={[styles.colorBox, getColorStyle(waiting.targetColor)]} />
                        <Text style={styles.betAmount}>
                          R$ {(waiting.initialAmount * waiting.currentMultiplier).toFixed(2)}
                        </Text>
                      </View>
                      {waiting.remainingTries > 0 && (
                        <Text style={styles.martingaleInfo}>
                          Martingale restante: {waiting.remainingTries}x
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estratégias</Text>
            <View style={styles.strategyHeaderActions}>
              <Text style={styles.activeCount}>
                {strategies.filter(s => s.active).length} ativas
              </Text>
              <Pressable
                style={styles.addButton}
                onPress={() => setShowStrategyForm(true)}
              >
                <MaterialIcons name="add" size={20} color="#f4511e" />
                <Text style={styles.addButtonText}>Nova</Text>
              </Pressable>
            </View>
          </View>
          {strategies.map((strategy) => (
            <Pressable
              key={strategy.id}
              style={styles.strategyCard}
              onPress={() => setSelectedStrategy(strategy)}
            >
              <View style={styles.strategyHeader}>
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <Text style={[
                  styles.profitIndicator,
                  strategy.stats.profit >= 0 ? styles.profit : styles.loss
                ]}>
                  R$ {Math.abs(strategy.stats.profit).toFixed(2)}
                  {strategy.stats.profit >= 0 ? ' ✓' : ' ✗'}
                </Text>
              </View>

              <View style={styles.strategyContent}>
                <View style={styles.patternSection}>
                  <Text style={styles.sectionLabel}>Padrão:</Text>
                  <View style={styles.patternContainer}>
                    {strategy.pattern.map((p, idx) => (
                      <View key={idx} style={styles.patternItem}>
                        <View style={[styles.colorBox, styles[p.color]]} />
                        <Text style={styles.patternPosition}>{idx + 1}º</Text>
                      </View>
                    ))}
                    <MaterialIcons 
                      name="arrow-forward" 
                      size={20} 
                      color="#666" 
                      style={styles.arrowIcon}
                    />
                    <View style={[
                      styles.colorBox, 
                      styles[strategy.betConfig.targetColor],
                      styles.targetColor
                    ]} />
                  </View>
                </View>

                <View style={styles.statsSection}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <MaterialIcons name="attach-money" size={16} color="#666" />
                      <Text style={styles.statLabel}>Aposta: </Text>
                      <Text style={styles.statValue}>
                        R$ {strategy.betConfig.initialAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons name="casino" size={16} color="#666" />
                      <Text style={styles.statLabel}>Martingale: </Text>
                      <Text style={styles.statValue}>{strategy.betConfig.martingale}x</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, styles.wins]}>
                        ✓ {strategy.stats.wins}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, styles.losses]}>
                        ✗ {strategy.stats.losses}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.winRate}>
                        {((strategy.stats.wins / (strategy.stats.totalBets || 1)) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
          {strategies.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhuma estratégia cadastrada ainda
            </Text>
          )}
        </View>
      </ScrollView>

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={onUpdateSettings}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showStrategyForm}
      >
        <View style={styles.strategyModalContainer}>
          <View style={styles.strategyModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Estratégia</Text>
              <Pressable onPress={() => setShowStrategyForm(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>
            <StrategyForm onSave={(strategy) => {
              onSaveStrategy(strategy);
              setShowStrategyForm(false);
            }} />
          </View>
        </View>
      </Modal>

      {selectedStrategy && (
        <StatsModal
          visible={true}
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          onToggle={onToggleStrategy}
          onDelete={handleDelete}
        />
      )}

      <SupportModal 
        visible={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  profitBadge: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  profitLabel: {
    fontSize: 12,
    color: '#666',
  },
  profitValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#666',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeCount: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  resultWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  resultBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  resultIndex: {
    fontSize: 12,
    color: '#666',
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whiteText: {
    color: '#000',
  },
  strategyItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  strategyInfo: {
    flex: 1,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  strategyDetails: {
    flexDirection: 'column',
    gap: 8,
  },
  patternContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  patternItem: {
    alignItems: 'center',
    gap: 2,
  },
  patternPosition: {
    fontSize: 12,
    color: '#666',
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
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
    borderColor: '#000',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
  potentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff3ef',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f4511e20',
  },
  potentialInfo: {
    flex: 1,
  },
  potentialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  potentialPattern: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nextColor: {
    borderWidth: 2,
    borderColor: '#f4511e',
    transform: [{ scale: 1.2 }],
  },
  confidenceContainer: {
    alignItems: 'center',
    backgroundColor: '#f4511e15',
    padding: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#666',
  },
  strategyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3ef',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#f4511e',
    fontWeight: '600',
    fontSize: 14,
  },
  strategyModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  strategyModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  statValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  wins: {
    color: '#4caf50',
  },
  losses: {
    color: '#f44336',
    marginLeft: 8,
  },
  waitingItem: {
    backgroundColor: '#fff0e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f4511e20',
  },
  waitingInfo: {
    gap: 8,
  },
  waitingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  waitingDetails: {
    gap: 4,
  },
  betInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  betLabel: {
    color: '#666',
    fontSize: 14,
  },
  betAmount: {
    fontWeight: '600',
    color: '#f4511e',
    fontSize: 14,
  },
  martingaleInfo: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  profitIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  strategyContent: {
    padding: 16,
    gap: 16,
  },
  patternSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  targetColor: {
    borderWidth: 2,
    borderColor: '#f4511e',
    transform: [{ scale: 1.1 }],
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  statsSection: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  winRate: {
    color: '#f4511e',
    fontWeight: '600',
    fontSize: 16,
  },
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  toggleButton: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],
  },
  toggleButtonActive: {
    backgroundColor: '#f44336',
  },
  toggleButtonAnimating: {
    transform: [{ scale: 0.95 }],
  },
}); 