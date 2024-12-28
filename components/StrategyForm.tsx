import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Color, Pattern, Strategy } from '../types/strategy';
import ColorSelector from './ColorSelector';
import { MaterialIcons } from '@expo/vector-icons';
import { geminiService } from '../services/gemini';

interface Props {
  onSave: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
  lastResults: Array<{color: string, number: number}>;
}

export default function StrategyForm({ onSave, lastResults }: Props) {
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<Pattern[]>([]);
  const [betAmount, setBetAmount] = useState('');
  const [martingale, setMartingale] = useState('0');
  const [targetColor, setTargetColor] = useState<Color>('red');
  const [isGenerating, setIsGenerating] = useState(false);

  const addColor = (color: Color) => {
    setPattern([...pattern, { color, position: pattern.length + 1 }]);
  };

  const removeColor = (index: number) => {
    setPattern(pattern.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (name && pattern.length > 0 && betAmount) {
      onSave({
        name,
        pattern,
        active: true,
        betConfig: {
          initialAmount: Number(betAmount),
          martingale: Number(martingale),
          targetColor,
        },
        stats: {
          wins: 0,
          losses: 0,
          currentLossStreak: 0,
          totalMartingales: 0,
          profit: 0,
          totalBets: 0,
          highestStreak: {
            wins: 0,
            losses: 0
          }
        }
      });
      setName('');
      setPattern([]);
      setBetAmount('');
      setMartingale('0');
    }
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const strategy = await geminiService.generateStrategy(lastResults);
      
      setName(strategy.name);
      setPattern(strategy.pattern.map((color: Color, index: number) => ({
        color,
        position: index + 1
      })));
      setTargetColor(strategy.betConfig.targetColor);
      setBetAmount(strategy.betConfig.initialAmount.toString());
      setMartingale(strategy.betConfig.martingale.toString());
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar a estratégia. Verifique sua API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Nova Estratégia</Text>
        <Pressable 
          style={[styles.aiButton, isGenerating && styles.aiButtonDisabled]}
          onPress={generateWithAI}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="psychology" size={20} color="#fff" />
              <Text style={styles.aiButtonText}>Gerar com IA</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome da estratégia"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuração da Aposta</Text>
        <View style={styles.betContainer}>
          <View style={styles.betInputWrapper}>
            <Text style={styles.inputLabel}>Valor Inicial</Text>
            <TextInput
              style={[styles.input, styles.betInput]}
              value={betAmount}
              onChangeText={setBetAmount}
              placeholder="R$ 0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.betInputWrapper}>
            <Text style={styles.inputLabel}>Martingale</Text>
            <TextInput
              style={[styles.input, styles.betInput]}
              value={martingale}
              onChangeText={setMartingale}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.targetColorSection}>
          <Text style={styles.inputLabel}>Cor da Aposta</Text>
          <View style={styles.colorOptions}>
            {(['red', 'black', 'white'] as Color[]).map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  styles[color],
                  targetColor === color && styles.selectedColor
                ]}
                onPress={() => setTargetColor(color)}
              >
                {targetColor === color && (
                  <MaterialIcons name="check" size={20} color={color === 'white' ? '#000' : '#fff'} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Padrão de Entrada</Text>
        <Text style={styles.description}>
          Selecione a sequência de cores que deve aparecer para realizar a aposta
        </Text>
        <ColorSelector onSelect={addColor} />
        <View style={styles.selectedPattern}>
          {pattern.map((p, index) => (
            <Pressable
              key={index}
              style={[styles.patternItem]}
              onPress={() => removeColor(index)}
            >
              <View style={[styles.colorBox, styles[p.color]]} />
              <Text style={styles.patternPosition}>{index + 1}º</Text>
              <MaterialIcons name="close" size={16} color="#666" />
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable 
        style={[
          styles.button,
          (!name || !pattern.length || !betAmount) && styles.buttonDisabled
        ]} 
        onPress={handleSave}
        disabled={!name || !pattern.length || !betAmount}
      >
        <MaterialIcons 
          name="save" 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.buttonText}>Salvar Estratégia</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  betContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  betInputWrapper: {
    flex: 1,
  },
  betInput: {
    textAlign: 'center',
  },
  targetColorSection: {
    marginTop: 8,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  selectedColor: {
    borderColor: '#f4511e',
    transform: [{ scale: 1.1 }],
  },
  selectedPattern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    minHeight: 50,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  patternPosition: {
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
  button: {
    backgroundColor: '#f4511e',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  aiButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
}); 