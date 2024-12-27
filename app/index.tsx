import { View, Text, StyleSheet, Pressable, Image, Linking, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const openInstagram = () => {
    Linking.openURL('https://instagram.com/rosielvictor');
  };

  const openUpdatesChannel = () => {
    Linking.openURL('https://www.instagram.com/channel/AbZE-r1Rqb9OdjEM/');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f4511e', '#ff7043']}
        style={styles.header}
      >
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bet Stats</Text>
        <Text style={styles.subtitle}>
          Sua ferramenta profissional de análise
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.highlightSection}>
          <Text style={styles.highlightTitle}>Em Breve</Text>
          <View style={styles.comingSoonFeatures}>
            <View style={styles.comingSoonItem}>
              <MaterialIcons name="casino" size={24} color="#f4511e" />
              <Text style={styles.comingSoonText}>Crash</Text>
            </View>
            <View style={styles.comingSoonItem}>
              <MaterialIcons name="sports-football" size={24} color="#f4511e" />
              <Text style={styles.comingSoonText}>Futebol</Text>
            </View>
            <View style={styles.comingSoonItem}>
              <MaterialIcons name="sports-basketball" size={24} color="#f4511e" />
              <Text style={styles.comingSoonText}>Basquete</Text>
            </View>
          </View>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialIcons name="analytics" size={32} color="#f4511e" />
            <Text style={styles.featureTitle}>Análise Avançada</Text>
            <Text style={styles.featureDescription}>
              Algoritmos inteligentes para identificar padrões e tendências em tempo real
            </Text>
          </View>

          <View style={styles.featureItem}>
            <MaterialIcons name="auto-graph" size={32} color="#f4511e" />
            <Text style={styles.featureTitle}>Estratégias Profissionais</Text>
            <Text style={styles.featureDescription}>
              Crie estratégias complexas com múltiplos padrões e análise estatística
            </Text>
          </View>

          <View style={styles.featureItem}>
            <MaterialIcons name="notifications-active" size={32} color="#f4511e" />
            <Text style={styles.featureTitle}>Alertas Precisos</Text>
            <Text style={styles.featureDescription}>
              Notificações em tempo real com análise de confiança e probabilidade
            </Text>
          </View>
        </View>

        <View style={styles.communitySection}>
          <Text style={styles.communityTitle}>Faça Parte da Comunidade</Text>
          <Text style={styles.communityDescription}>
            Siga nossos canais e fique por dentro das novidades, atualizações e dicas exclusivas!
          </Text>
          
          <View style={styles.socialLinks}>
            <Pressable style={styles.socialButton} onPress={openInstagram}>
              <MaterialIcons name="person" size={20} color="#f4511e" />
              <Text style={styles.socialText}>Desenvolvedor</Text>
            </Pressable>

            <Pressable style={styles.socialButton} onPress={openUpdatesChannel}>
              <MaterialIcons name="notifications" size={20} color="#f4511e" />
              <Text style={styles.socialText}>Canal de Updates</Text>
            </Pressable>
          </View>
        </View>

        <Link href="/blaze/double" asChild>
          <Pressable style={styles.startButton}>
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Começar Agora</Text>
          </Pressable>
        </Link>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Apoie o Projeto</Text>
          <Text style={styles.supportDescription}>
            Sua contribuição nos ajuda a manter o app gratuito e trazer novos recursos incríveis!
          </Text>
          <Text style={styles.pixKey}>PIX: rosielvictor.dev@gmail.com</Text>
        </View>

        <Text style={styles.disclaimer}>
          Este app é uma ferramenta de análise estatística.{'\n'}
          Não garantimos resultados específicos.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 40,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  highlightSection: {
    marginBottom: 24,
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comingSoonItem: {
    alignItems: 'center',
    gap: 8,
  },
  comingSoonText: {
    color: '#666',
    fontWeight: '500',
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  communitySection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  socialText: {
    color: '#f4511e',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  supportSection: {
    backgroundColor: '#fff0e8',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  pixKey: {
    fontSize: 16,
    color: '#f4511e',
    fontWeight: '500',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 