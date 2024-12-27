import { View, Pressable, StyleSheet } from 'react-native';
import { Color } from '../types/strategy';

interface Props {
  onSelect: (color: Color) => void;
}

export default function ColorSelector({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.colorBox, styles.red]}
        onPress={() => onSelect('red')}
      />
      <Pressable
        style={[styles.colorBox, styles.black]}
        onPress={() => onSelect('black')}
      />
      <Pressable
        style={[styles.colorBox, styles.white]}
        onPress={() => onSelect('white')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 4,
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
}); 