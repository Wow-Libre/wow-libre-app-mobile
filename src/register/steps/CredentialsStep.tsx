import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {StepProps} from '../types';
import {existEmail, existPhone} from '../../api/internal';

const CredentialsStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onBack,
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const validateStep = async () => {
    // Validación básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return false;
    }
    if (formData.cellphone.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido.');
      return false;
    }

    // Validar si el email ya existe
    setIsValidating(true);
    try {
      const emailExists = await existEmail(formData.email);
      if (emailExists.exist) {
        Alert.alert(
          'Error',
          'Este correo electrónico ya está registrado. Por favor usa otro.',
        );
        setIsValidating(false);
        return false;
      }

      // Validar si el teléfono ya existe
      const phoneExists = await existPhone(formData.cellphone);
      if (phoneExists.exist) {
        Alert.alert(
          'Error',
          'Este número de teléfono ya está registrado. Por favor usa otro.',
        );
        setIsValidating(false);
        return false;
      }

      setIsValidating(false);
      return true;
    } catch (error: any) {
      setIsValidating(false);
      Alert.alert(
        'Error',
        'No se pudo validar los datos. Por favor intenta de nuevo.',
      );
      return false;
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.subTitle}>
        Esto es lo que utilizarás cuando inicies sesión en los sitios web y
        aplicaciones móviles.
      </Text>
      <Text style={styles.label}>Correo electrónico:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ejemplo: usuario@mail.com"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={value => onUpdateFormData({email: value})}
      />

      <Text style={styles.label}>Ingrese un número de teléfono:</Text>
      <TextInput
        style={styles.input}
        placeholder="+"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        value={formData.cellphone}
        onChangeText={value => onUpdateFormData({cellphone: value})}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isValidating && styles.buttonDisabled]}
          onPress={async () => {
            if (await validateStep()) {
              onNext();
            }
          }}
          disabled={isValidating}>
          <Text style={styles.buttonText}>
            {isValidating ? 'Validando...' : 'Siguiente'}
          </Text>
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CredentialsStep;

