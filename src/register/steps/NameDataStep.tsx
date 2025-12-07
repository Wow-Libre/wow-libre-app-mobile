import React from 'react';
import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {StepProps} from '../types';

const NameDataStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onBack,
}) => {
  const validateStep = () => {
    if (formData.lastName.length < 5) {
      Alert.alert('Error', 'El nombre debe tener al menos 5 caracteres.');
      return false;
    }
    if (formData.firstName.length < 5) {
      Alert.alert('Error', 'El apellido debe tener al menos 5 caracteres.');
      return false;
    }
    return true;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.subTitle}>
        Es posible que se utilice tu nombre real en el futuro para verificar tu
        identidad cuando te pongas en contacto con WowLibre. Por defecto, tu
        nombre real permanecerá oculto para otros usuarios.
      </Text>
      <Text style={styles.label}>Ingrese sus nombres:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre personales"
        placeholderTextColor="#aaa"
        keyboardType="default"
        value={formData.firstName}
        onChangeText={value => onUpdateFormData({firstName: value})}
      />

      <Text style={styles.label}>Ingrese sus apellidos:</Text>
      <TextInput
        style={styles.input}
        placeholder="Apellido personales"
        placeholderTextColor="#aaa"
        keyboardType="default"
        value={formData.lastName}
        onChangeText={value => onUpdateFormData({lastName: value})}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (validateStep()) {
              onNext();
            }
          }}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: 'light',
    textAlign: 'center',
    marginBottom: 24,
    color: '#ffffff',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: '1%',
    fontSize: 14,
    color: '#bbb',
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#1e1e1e',
    fontSize: 16,
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#888',
  },
});

export default NameDataStep;

