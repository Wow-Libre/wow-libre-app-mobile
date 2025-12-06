import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Recaptcha from 'react-native-recaptcha-that-works';
import {RecaptchaRef} from 'react-native-recaptcha-that-works';
import {Configs} from '../../constant';
import {StepProps} from '../types';

interface PasswordStepProps extends Omit<StepProps, 'onNext'> {
  onRegister: (token: string) => Promise<void>;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  formData,
  onUpdateFormData,
  onBack,
  onRegister,
}) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRecaptchaOpen, setIsRecaptchaOpen] = useState(false);
  const recaptcha = useRef<RecaptchaRef>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar que el reCAPTCHA se inicializa correctamente
  useEffect(() => {
    console.log('PasswordStep montado, reCAPTCHA ref:', recaptcha.current ? 'Presente' : 'Null');
    console.log('Site Key:', Configs.KEY_GOOGLE_RECAPTCHA);
    console.log('Base URL:', Configs.RECAPTCHA_BASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
  }, []);

  // Timeout de seguridad para resetear el loading si pasa mucho tiempo
  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Timeout: El registro está tomando demasiado tiempo');
        setIsLoading(false);
        setErrorMessage('El registro está tomando demasiado tiempo. Por favor intenta de nuevo.');
        setErrorModalVisible(true);
      }, 60000); // 60 segundos
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);

  const validatePasswords = () => {
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (formData.password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const onVerify = React.useCallback(async (token: any) => {
    console.log('=== reCAPTCHA VERIFICADO ===');
    console.log('Token recibido:', token ? 'Token presente' : 'Sin token');
    console.log('Token value:', token);
    setIsRecaptchaOpen(false);
    
    if (!token) {
      console.error('Token es null o undefined');
      setIsLoading(false);
      setErrorMessage('No se recibió el token de verificación. Por favor intenta de nuevo.');
      setErrorModalVisible(true);
      return;
    }
    
    setIsLoading(true);
    console.log('Iniciando registro con token...');
    try {
      await onRegister(token);
      console.log('Registro exitoso - navegando...');
      // Si el registro es exitoso, el componente padre manejará la navegación
      // No resetear el loading aquí porque se navegará a otra pantalla
    } catch (error: any) {
      console.error('=== ERROR EN REGISTRO ===');
      console.error('Error completo:', error);
      console.error('Error message:', error?.message);
      setIsLoading(false);
      const errorMsg =
        error?.message ||
        'No se pudo completar el registro. Por favor intenta de nuevo.';
      setErrorMessage(errorMsg);
      setErrorModalVisible(true);
    }
  }, [onRegister]);

  const onExpire = React.useCallback(() => {
    console.warn('=== reCAPTCHA EXPIRADO ===');
    setIsRecaptchaOpen(false);
    setIsLoading(false);
  }, []);

  const handleRegister = () => {
    console.log('=== INICIANDO REGISTRO ===');
    if (!validatePasswords()) {
      console.log('Validación de contraseñas falló');
      return;
    }
    if (!recaptcha.current) {
      console.error('reCAPTCHA ref es null');
      Alert.alert('Error', 'No se pudo inicializar el reCAPTCHA. Por favor intenta de nuevo.');
      return;
    }
    console.log('Abriendo reCAPTCHA...');
    console.log('reCAPTCHA ref:', recaptcha.current);
    console.log('onVerify callback:', typeof onVerify);
    setIsRecaptchaOpen(true);
    
    // Intentar abrir el reCAPTCHA
    // Si hay un error, se manejará en onVerify o onExpire
    try {
      recaptcha.current.open();
      console.log('reCAPTCHA.open() llamado exitosamente');
    } catch (error) {
      console.error('Error al llamar recaptcha.current.open():', error);
      setIsRecaptchaOpen(false);
      Alert.alert('Error', 'No se pudo abrir el reCAPTCHA. Por favor intenta de nuevo.');
    }
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
    setIsLoading(false);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.subTitle}>
        Protege tu cuenta y elige una contraseña segura para la web
        administrativa.
      </Text>
      <Text style={styles.label}>Contraseña para la web:</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={formData.password}
        onChangeText={value => onUpdateFormData({password: value})}
      />

      <Text style={styles.label}>Confirmar Contraseña:</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onBack}
            disabled={isLoading}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        )}
        <Recaptcha
          ref={recaptcha}
          siteKey={Configs.KEY_GOOGLE_RECAPTCHA}
          baseUrl={Configs.RECAPTCHA_BASE_URL}
          onVerify={onVerify}
          onExpire={onExpire}
          size="normal"
        />
      </View>

      {/* Modal de Error */}
      <Modal
        visible={errorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeErrorModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error en el Registro</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeErrorModal}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PasswordStep;

