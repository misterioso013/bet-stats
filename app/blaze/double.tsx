import { WebView } from 'react-native-webview';
import { StyleSheet, View, Text, Vibration, Alert } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strategy } from '../types/strategy';
import StrategyForm from '../components/StrategyForm';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync } from 'expo-keep-awake';

interface PotentialStrategy {
  strategy: Strategy;
  missingColor: string;
  confidence: number;
}

interface WaitingStrategy {
  id: string;
  targetColor: string;
  remainingTries: number;
  initialAmount: number;
  currentMultiplier: number;
}

export default function BlazeDouble() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [lastResults, setLastResults] = useState<Array<{color: string, number: number}>>([]);
  const [showWebView, setShowWebView] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const [potentialStrategies, setPotentialStrategies] = useState<PotentialStrategy[]>([]);
  const [settings, setSettings] = useState({
    historySize: 20,
    confidenceWindow: 50,
  });
  const [sound, setSound] = useState<Audio.Sound>();
  const [waitingStrategies, setWaitingStrategies] = useState<WaitingStrategy[]>([]);
  const donationAlertRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const setupApp = async () => {
      await activateKeepAwakeAsync();
      loadStrategies();
      loadSettings();
      loadSound();
      startDonationAlerts();
    };

    setupApp();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      sound?.unloadAsync();
      if (donationAlertRef.current) {
        clearInterval(donationAlertRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(20);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const loadStrategies = async () => {
    try {
      const savedStrategies = await AsyncStorage.getItem('strategies');
      if (savedStrategies) {
        const parsedStrategies = JSON.parse(savedStrategies);
        const updatedStrategies = parsedStrategies.map((strategy: Strategy) => ({
          ...strategy,
          betConfig: strategy.betConfig || {
            initialAmount: 0,
            martingale: 0,
            targetColor: 'red' as const
          },
          stats: {
            wins: strategy.stats?.wins || 0,
            losses: strategy.stats?.losses || 0,
            currentLossStreak: strategy.stats?.currentLossStreak || 0,
            totalMartingales: strategy.stats?.totalMartingales || 0,
            profit: strategy.stats?.profit || 0,
            totalBets: strategy.stats?.totalBets || 0,
            highestStreak: {
              wins: strategy.stats?.highestStreak?.wins || 0,
              losses: strategy.stats?.highestStreak?.losses || 0
            }
          }
        }));
        setStrategies(updatedStrategies);
        await AsyncStorage.setItem('strategies', JSON.stringify(updatedStrategies));
      }
    } catch (error) {
      console.error('Erro ao carregar estratégias:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateSettings = async (newSettings: typeof settings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/notification.mp3')
    );
    setSound(sound);
  };

  const playNotification = async () => {
    try {
      Vibration.vibrate(2000);
      
      await sound?.setVolumeAsync(1.0);
      await sound?.setPositionAsync(0);
      await sound?.setIsLoopingAsync(false);
      await sound?.playAsync();
      
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Erro ao tocar notificação:', error);
    }
  };

  const checkPotentialStrategies = useCallback((results: Array<{color: string, number: number}>) => {
    const potential: PotentialStrategy[] = [];

    strategies.forEach(strategy => {
      if (strategy.active) {
        const patternLength = strategy.pattern.length;
        const currentResults = results.slice(0, patternLength - 1);
        
        const matches = strategy.pattern.slice(0, -1).every((p, index) => 
          currentResults[index]?.color === p.color
        );

        if (matches && currentResults.length === patternLength - 1) {
          const missingColor = strategy.pattern[patternLength - 1].color;
          const confidence = calculateConfidence(results, missingColor);
          
          potential.push({
            strategy,
            missingColor,
            confidence
          });

          if (confidence > 50) {
            Vibration.vibrate(500);
          }
        }
      }
    });

    setPotentialStrategies(potential);
  }, [strategies]);

  const calculateConfidence = (results: Array<{color: string, number: number}>, targetColor: string) => {
    const windowResults = results.slice(0, settings.confidenceWindow);
    const colorCount = windowResults.filter(r => r.color === targetColor).length;
    return (colorCount / windowResults.length) * 100;
  };

  const checkStrategies = useCallback(async (results: Array<{color: string, number: number}>) => {
    checkPotentialStrategies(results);
    
    // Primeiro verifica as estratégias que estão aguardando resultado
    if (waitingStrategies.length > 0 && results.length > 0) {
      const lastResult = results[0];
      const updatedWaiting: WaitingStrategy[] = [];
      const updatedStrategies = [...strategies];

      for (const waiting of waitingStrategies) {
        const strategy = strategies.find(s => s.id === waiting.id);
        if (!strategy) continue;

        if (lastResult.color === waiting.targetColor) {
          // Win - Atualiza estatísticas
          const strategyIndex = updatedStrategies.findIndex(s => s.id === waiting.id);
          if (strategyIndex !== -1) {
            const currentStats = updatedStrategies[strategyIndex].stats;
            // Calcula o multiplicador baseado na cor
            const colorMultiplier = waiting.targetColor === 'white' ? 14 : 2;
            const profit = waiting.initialAmount * waiting.currentMultiplier * colorMultiplier;
            
            updatedStrategies[strategyIndex] = {
              ...strategy,
              stats: {
                ...currentStats,
                wins: currentStats.wins + 1,
                currentLossStreak: 0,
                totalBets: (currentStats.totalBets || 0) + 1,
                profit: (currentStats.profit || 0) + profit,
                totalMartingales: currentStats.totalMartingales + 
                  (strategy.betConfig.martingale - waiting.remainingTries),
                highestStreak: {
                  wins: Math.max((currentStats.highestStreak?.wins || 0) + 1, 1),
                  losses: currentStats.highestStreak?.losses || 0
                }
              }
            };
          }
        } else if (waiting.remainingTries > 0) {
          // Continua aguardando e incrementa martingale
          updatedWaiting.push({
            ...waiting,
            remainingTries: waiting.remainingTries - 1,
            currentMultiplier: waiting.currentMultiplier * 2
          });
        } else {
          // Loss - Atualiza estatísticas
          const strategyIndex = updatedStrategies.findIndex(s => s.id === waiting.id);
          if (strategyIndex !== -1) {
            const currentStats = updatedStrategies[strategyIndex].stats;
            const totalLoss = waiting.initialAmount * waiting.currentMultiplier;
            
            updatedStrategies[strategyIndex] = {
              ...strategy,
              stats: {
                ...currentStats,
                losses: currentStats.losses + 1,
                currentLossStreak: (currentStats.currentLossStreak || 0) + 1,
                totalBets: (currentStats.totalBets || 0) + 1,
                profit: (currentStats.profit || 0) - totalLoss,
                totalMartingales: currentStats.totalMartingales + strategy.betConfig.martingale,
                highestStreak: {
                  wins: currentStats.highestStreak?.wins || 0,
                  losses: Math.max(
                    (currentStats.highestStreak?.losses || 0),
                    (currentStats.currentLossStreak || 0) + 1
                  )
                }
              }
            };
          }
        }
      }

      setWaitingStrategies(updatedWaiting);
      setStrategies(updatedStrategies);
      await AsyncStorage.setItem('strategies', JSON.stringify(updatedStrategies));
    }

    // Só verifica novas estratégias se não houver nenhuma em espera
    if (waitingStrategies.length === 0) {
      strategies.forEach(strategy => {
        if (strategy.active) {
          const patternLength = strategy.pattern.length;
          const lastResults = results.slice(0, patternLength);
          
          const matches = strategy.pattern.every((p, index) => 
            lastResults[index]?.color === p.color
          );

          if (matches) {
            setShowWebView(true);
            startCountdown();
            playNotification();

            // Adiciona à lista de espera
            setWaitingStrategies(prev => [...prev, {
              id: strategy.id,
              targetColor: strategy.betConfig.targetColor,
              remainingTries: strategy.betConfig.martingale,
              initialAmount: strategy.betConfig.initialAmount,
              currentMultiplier: 1
            }]);
          }
        }
      });
    }
  }, [strategies, waitingStrategies]);

  const onMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (Array.isArray(data)) {
      setLastResults(data);
      checkStrategies(data);
    }
  };

  let toggleCount = 0;
  const toggleStrategy = async (id: string) => {
    const updatedStrategies = strategies.map(strategy =>
      strategy.id === id ? { ...strategy, active: !strategy.active } : strategy
    );
    setStrategies(updatedStrategies);
    
    try {
      await AsyncStorage.setItem('strategies', JSON.stringify(updatedStrategies));
      toggleCount++;
      if (toggleCount >= 3) {
        toggleCount = 0;
      }
    } catch (error) {
      console.error('Erro ao atualizar estratégia:', error);
    }
  };

  const saveStrategy = async (newStrategy: Omit<Strategy, 'id' | 'createdAt'>) => {
    const strategy: Strategy = {
      ...newStrategy,
      id: Date.now().toString(),
      createdAt: new Date(),
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
    };

    const updatedStrategies = [...strategies, strategy];
    setStrategies(updatedStrategies);
    
    try {
      await AsyncStorage.setItem('strategies', JSON.stringify(updatedStrategies));
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error);
    }
  };

  const deleteStrategy = async (id: string) => {
    const updatedStrategies = strategies.filter(strategy => strategy.id !== id);
    setStrategies(updatedStrategies);
    try {
      await AsyncStorage.setItem('strategies', JSON.stringify(updatedStrategies));
    } catch (error) {
      console.error('Erro ao excluir estratégia:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.addedNodes.length > 0 &&
            mutation.addedNodes[0].tagName === "DIV"
          ) {
            let result = [];
            let divs = document.querySelectorAll(".entries .entry");
            divs.forEach(function (div) {
              let number = parseInt(div.innerText.split(" ")[0]);
              let color = number >= 8 ? "black" : number <= 7 ? "red" : "white";
              result.push({
                number: number ? number : 0,
                color: color,
              });
            });

            window.ReactNativeWebView.postMessage(JSON.stringify(result));

            let text = "";
            document
              .querySelector(
                "#roulette-recent > div > div.entries.main > div:nth-child(1) > div > div"
              )
              .click();
            setTimeout(function () {
              text = document.querySelector(
                "#roulette-game-history > div.header > h2"
              ).textContent;

              if (text) {
                document
                  .querySelector(
                    "#root > main > div.modal-portal > div > div.close"
                  )
                  .click();
                const time = text.split(" ");
                const date = time[3].split("/");
                const hour = time[4].split(":");
                const date_time = new Date(
                  date[2],
                  date[1] - 1,
                  date[0],
                  hour[0],
                  hour[1],
                  new Date().getSeconds()
                );
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  result: result[0].number,
                  color: result[0].color,
                  date: date_time.toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  }),
                }));
              }
            }, 500);
          }
        });
      });

      observer.observe(
        document.querySelector("#roulette-recent > div > div.entries.main"),
        {
          childList: true,
        }
      );
    })();
  `;

  const handleWebViewToggle = () => {
    const newState = !showWebView;
    setShowWebView(newState);
    
    if (!newState) { // Quando fecha o site
      // Removido referência ao adsTimerRef
    } else { // Quando abre o site
      // Removido referência ao adsTimerRef
    }
  };

  const startDonationAlerts = () => {
    // Array de mensagens apelativas
    const messages = [
      'Se você está curtindo o app, contribua com qualquer valor no pix, isso vai nos ajudar bastante! 🙏',
      'Sua contribuição é muito importante para mantermos o app atualizado e gratuito! 💝',
      'Gostou do app? Ajude-nos a continuar melhorando com uma contribuição via pix! ⭐',
      'Sua doação nos motiva a trazer mais funcionalidades incríveis! 🚀',
      'Contribua com qualquer valor para apoiar o desenvolvimento do app! 💪'
    ];

    donationAlertRef.current = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      Alert.alert(
        'Apoie o Desenvolvedor',
        randomMessage,
        [
          {
            text: 'Agora não',
            style: 'cancel'
          },
          {
            text: 'Contribuir',
            onPress: () => setShowSupport(true)
          }
        ],
        { cancelable: true }
      );
    }, 300000); // 5 minutos (300000ms)
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.content,
        showWebView && styles.contentCollapsed
      ]}>
        <AnalyticsPanel
          strategies={strategies}
          lastResults={lastResults}
          potentialStrategies={potentialStrategies}
          onToggleStrategy={toggleStrategy}
          onShowWebView={handleWebViewToggle}
          showWebView={showWebView}
          settings={settings}
          onUpdateSettings={updateSettings}
          onSaveStrategy={saveStrategy}
          onDeleteStrategy={deleteStrategy}
          waitingStrategies={waitingStrategies}
        />
        {countdown !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              Tempo restante: {countdown}s
            </Text>
          </View>
        )}
      </View>
      <View style={[
        styles.webviewContainer,
        !showWebView && styles.webviewHidden
      ]}>
        <WebView
          source={{ uri: 'https://blaze.com/pt/games/double' }}
          style={styles.webview}
          injectedJavaScript={injectedJavaScript}
          onMessage={onMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    height: '100%',
  },
  contentCollapsed: {
    height: '20%',
  },
  webviewContainer: {
    height: '80%',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  webviewHidden: {
    height: 0,
  },
  webview: {
    flex: 1,
  },
  countdownContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    margin: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  countdownText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 