import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
interface Props {
  visible: boolean;
  onClose: () => void;
  settings: {
    historySize: number;
    confidenceWindow: number;
  };
  onSave: (settings: { historySize: number; confidenceWindow: number }) => void;
}

export default function SettingsModal({ visible, onClose, settings, onSave }: Props) {
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configurações</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Resultados mostrados: {tempSettings.historySize}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={50}
              step={5}
              value={tempSettings.historySize}
              onValueChange={(value: number) => 
                setTempSettings(prev => ({ ...prev, historySize: value }))
              }
              minimumTrackTintColor="#f4511e"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#f4511e"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Base para cálculo de probabilidade: {tempSettings.confidenceWindow}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={20}
              maximumValue={100}
              step={10}
              value={tempSettings.confidenceWindow}
              onValueChange={(value: number) =>
                setTempSettings(prev => ({ ...prev, confidenceWindow: value }))
              }
              minimumTrackTintColor="#f4511e"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#f4511e"
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 