import React from 'react';
import {Alert, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import {StepProps} from '../types';

const TermsStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onBack,
}) => {
  const validateStep = () => {
    if (!formData.termsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones.');
      return false;
    }
    if (!formData.offersAccepted) {
      Alert.alert('Error', 'Debes aceptar recibir ofertas especiales.');
      return false;
    }
    return true;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.subTitle}>
        ¡Bienvenido a Wow Libre! Aceptar nuestras opciones te permite
        sumergirte en una experiencia personalizada llena de ofertas exclusivas,
        noticias emocionantes y mucho más.
      </Text>

      <View style={styles.checkboxCard}>
        <Switch
          value={formData.termsAccepted ?? false}
          onValueChange={newValue =>
            onUpdateFormData({termsAccepted: newValue})
          }
          trackColor={{false: '#444', true: '#1e88e5'}}
          thumbColor={formData.termsAccepted ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#444"
          style={styles.switch}
        />
        <Text style={styles.checkboxLabel}>
          He leído y acepto los Términos y condiciones
        </Text>
      </View>

      <View style={styles.checkboxCard}>
        <Switch
          value={formData.offersAccepted ?? false}
          onValueChange={newValue =>
            onUpdateFormData({offersAccepted: newValue})
          }
          trackColor={{false: '#444', true: '#1e88e5'}}
          thumbColor={formData.offersAccepted ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#444"
          style={styles.switch}
        />
        <Text style={styles.checkboxLabel}>
          El correo de la cuenta recibirá ofertas especiales, noticias
        </Text>
      </View>

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
  checkboxCard: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  switch: {
    transform: [{scaleX: 0.85}, {scaleY: 0.85}],
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 10,
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
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

export default TermsStep;

