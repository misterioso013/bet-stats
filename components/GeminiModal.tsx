import { View, Text, StyleSheet, Modal, Pressable, TextInput, ActivityIndicator, Linking, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { geminiService } from '../services/gemini';

type ColorStyle = 'red' | 'black' | 'white';

interface Props {
  visible: boolean;
  onClose: () => void;
  lastResults: Array<{color: string, number: number}>;
}

export default function GeminiModal({ visible, onClose, lastResults }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [originalApiKey, setOriginalApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem('gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setOriginalApiKey(savedKey);
        geminiService.initialize(savedKey);
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (apiKey === originalApiKey) return;
    
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('gemini_api_key', apiKey);
      geminiService.initialize(apiKey);
      setOriginalApiKey(apiKey);
      analyze();
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const analyze = async () => {
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await geminiService.analyzePattern(lastResults);
      setAnalysis(result);
    } catch (error) {
      setError('Erro na análise. Verifique sua chave API.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !apiKey || isMessageLoading) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsMessageLoading(true);
    setError('');

    try {
      // Scroll para mostrar o loading
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const response = await geminiService.chat(userMessage, lastResults);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      
      // Scroll para mostrar a resposta
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      setError('Erro ao enviar mensagem. Verifique sua API key.');
    } finally {
      setIsMessageLoading(false);
    }
  };

  const renderContent = () => {
    return (
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurar API Key</Text>
          <Text style={styles.description}>
            Obtenha sua chave em: <Text style={styles.link} onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}>aistudio.google.com/apikey</Text>
          </Text>
          <View style={styles.apiKeyContainer}>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Cole sua API key aqui"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />
            <Pressable 
              style={[
                styles.saveButton,
                apiKey === originalApiKey && styles.saveButtonDisabled
              ]} 
              onPress={saveApiKey}
              disabled={apiKey === originalApiKey || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </Pressable>
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {showChat ? (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatMessages}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.messageContainer,
                    msg.role === 'user' ? styles.userMessage : styles.aiMessage
                  ]}
                >
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
              ))}
              {isMessageLoading && (
                <View style={[styles.messageContainer, styles.aiMessage]}>
                  <View style={styles.loadingMessage}>
                    <ActivityIndicator size="small" color="#f4511e" />
                    <Text style={styles.loadingText}>Analisando...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.chatInput,
                  isMessageLoading && styles.chatInputDisabled
                ]}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Digite sua pergunta..."
                placeholderTextColor="#999"
                multiline
                editable={!isMessageLoading}
              />
              <Pressable 
                style={[
                  styles.sendButton,
                  (isMessageLoading || !inputMessage.trim()) && styles.sendButtonDisabled
                ]} 
                onPress={sendMessage}
                disabled={isMessageLoading || !inputMessage.trim()}
              >
                {isMessageLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="send" size={24} color="#fff" />
                )}
              </Pressable>
            </View>
          </View>
        ) : isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f4511e" />
            <Text style={styles.loadingText}>Analisando padrões...</Text>
          </View>
        ) : analysis ? (
          <View style={styles.analysisContainer}>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${analysis.confidence}%` }]} />
              <Text style={styles.confidenceText}>{analysis.confidence}% confiança</Text>
            </View>

            <Text style={styles.recommendationTitle}>Recomendação:</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation}</Text>

            <Text style={styles.reasoningTitle}>Análise Detalhada:</Text>
            <Text style={styles.reasoningText}>{analysis.reasoning}</Text>

            <View style={styles.betSuggestion}>
              <Text style={styles.betTitle}>Sugestão de Aposta:</Text>
              <View style={styles.betDetails}>
                <View style={[styles.colorBox, styles[analysis.suggestedBet.color as ColorStyle]]} />
                <Text style={styles.betAmount}>
                  R$ {analysis.suggestedBet.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {!isAnalyzing && apiKey && !showChat && (
          <Pressable style={styles.analyzeButton} onPress={analyze}>
            <MaterialIcons name="analytics" size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Analisar Novamente</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Análise IA</Text>
            <View style={styles.headerButtons}>
              <Pressable 
                style={styles.headerButton}
                onPress={() => setShowChat(!showChat)}
              >
                <MaterialIcons 
                  name={showChat ? "analytics" : "chat"} 
                  size={24} 
                  color="#666" 
                />
              </Pressable>
              <Pressable 
                style={styles.headerButton}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>
          </View>

          {renderContent()}
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  analysisContainer: {
    gap: 16,
  },
  confidenceBar: {
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#4caf50',
    borderRadius: 12,
  },
  confidenceText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recommendationText: {
    color: '#666',
    lineHeight: 20,
  },
  reasoningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reasoningText: {
    color: '#666',
    lineHeight: 20,
  },
  betSuggestion: {
    backgroundColor: '#fff0e8',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  betTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f4511e',
  },
  betDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  betAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginVertical: 16,
  },
  link: {
    color: '#f4511e',
    textDecorationLine: 'underline',
  },
  scrollView: {
    maxHeight: '85%',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#f4511e20',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#f8f8f8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 12,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#f4511e',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ddd',
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  sendButtonDisabled: {
    backgroundColor: '#ddd',
  },
}); 