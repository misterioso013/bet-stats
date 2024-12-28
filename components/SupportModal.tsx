import { View, Text, StyleSheet, Modal, Pressable, Linking, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SupportModal({ visible, onClose }: Props) {
  const PIX_KEY = 'rosielvictor.dev@gmail.com';
  const INSTAGRAM = 'https://instagram.com/rosielvictor';
  const UPDATES_CHANNEL = 'https://www.instagram.com/channel/AbZE-r1Rqb9OdjEM/';
  const COURSES = 'https://vemser.tech';
  const APP_SITE = 'https://all.dev.br/projects/bet-stats';

  const copyPixKey = async () => {
    await Clipboard.setStringAsync(PIX_KEY);
    alert('Chave PIX copiada!');
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: `Conheça o Bet Stats!\n\nBaixe agora: ${APP_SITE}\nAtualizações: ${UPDATES_CHANNEL}\nCursos: ${COURSES}\nDesenvolvedor: ${INSTAGRAM}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
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
            <Text style={styles.modalTitle}>Apoie o Desenvolvedor</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Faça uma Doação</Text>
            <Text style={styles.description}>
              Ajude a manter o app gratuito e com novas funcionalidades!
            </Text>
            <Pressable style={styles.pixButton} onPress={copyPixKey}>
              <MaterialIcons name="content-copy" size={20} color="#f4511e" />
              <Text style={styles.pixKey}>{PIX_KEY}</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Siga nas Redes Sociais</Text>
            <Pressable 
              style={styles.socialButton}
              onPress={() => Linking.openURL(INSTAGRAM)}
            >
              <MaterialIcons name="person" size={20} color="#f4511e" />
              <Text style={styles.socialText}>@rosielvictor</Text>
            </Pressable>

            <Pressable 
              style={styles.socialButton}
              onPress={() => Linking.openURL(UPDATES_CHANNEL)}
            >
              <MaterialIcons name="notifications" size={20} color="#f4511e" />
              <Text style={styles.socialText}>Canal de Atualizações</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cursos de Programação</Text>
            <Pressable 
              style={styles.courseButton}
              onPress={() => Linking.openURL(COURSES)}
            >
              <MaterialIcons name="school" size={20} color="#fff" />
              <Text style={styles.courseText}>Acessar VemSer.tech</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Download do App</Text>
            <Pressable 
              style={styles.downloadButton}
              onPress={() => Linking.openURL(APP_SITE)}
            >
              <MaterialIcons name="download" size={20} color="#fff" />
              <Text style={styles.downloadText}>Baixar Última Versão</Text>
            </Pressable>
          </View>

          <Pressable style={styles.shareButton} onPress={shareApp}>
            <MaterialIcons name="share" size={20} color="#f4511e" />
            <Text style={styles.shareText}>Compartilhar App</Text>
          </Pressable>
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
  pixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  pixKey: {
    color: '#f4511e',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  socialText: {
    color: '#f4511e',
    fontWeight: '500',
  },
  courseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  courseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareText: {
    color: '#f4511e',
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 