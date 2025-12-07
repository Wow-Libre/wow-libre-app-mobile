import React, {useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Images} from '../constant';
import {recoverPassword, validateRecoverPassword} from '../api/internal/index';
import {getUserData} from '../services/storage';

const RecoveryPassword = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Permitir alfanumérico y máximo 1 carácter
    if (value.length > 1) {
      value = value.slice(-1).toUpperCase(); // Tomar solo el último carácter y convertir a mayúscula
    } else {
      value = value.toUpperCase(); // Convertir a mayúscula
    }
    
    // Permitir letras y números
    if (/^[A-Z0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Si se ingresó un valor y no es el último campo, mover al siguiente
      if (value && index < 4) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 50);
      }
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setIsLoading(true);
      await recoverPassword(email);
      Alert.alert(
        'Código enviado',
        'Hemos enviado un código de verificación a tu correo electrónico',
      );
      // Resetear OTP cuando se cambia al step 2
      setOtp(['', '', '', '', '']);
      setStep(2);
    } catch (error: any) {
      console.error('Error al enviar código:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo enviar el código. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = otp.join('');
    if (code.length !== 5) {
      Alert.alert('Error', 'Por favor ingresa el código completo');
      return;
    }

    try {
      setIsLoading(true);
      // Obtener el idioma del usuario (por defecto 'es')
      const userData = await getUserData();
      const language = userData?.language || 'es';

      await validateRecoverPassword(email, code, language);
      Alert.alert(
        'Código verificado',
        'Tu código ha sido verificado correctamente. Ahora puedes cambiar tu contraseña.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar a la pantalla de cambio de contraseña o login
              navigation.navigate('Login');
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error al verificar código:', error);
      Alert.alert(
        'Error',
        error?.message || 'El código no es válido. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Header con imagen */}
            <View style={styles.header}>
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{uri: Images.RECOVER_ICON}}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Step 1: Ingresar Email */}
            {step === 1 && (
              <View style={styles.formContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Recuperar Contraseña</Text>
                  <Text style={styles.subtitle}>
                    Ingresa tu correo electrónico y te enviaremos un código de
                    verificación para restablecer tu contraseña
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Correo Electrónico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#6b7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enviar Código</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}>
                  <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Verificar Código OTP */}
            {step === 2 && (
              <View style={styles.formContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Código de Verificación</Text>
                  <Text style={styles.subtitle}>
                    Ingresa el código de 5 caracteres que enviamos a{'\n'}
                    <Text style={styles.emailHighlight}>{email}</Text>
                  </Text>
                </View>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={`otp-${index}`}
                      ref={ref => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                      ]}
                      keyboardType="default"
                      maxLength={1}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={({nativeEvent}) =>
                        handleOtpKeyPress(nativeEvent.key, index)
                      }
                      editable={!isLoading}
                      selectTextOnFocus={false}
                      autoComplete="off"
                      autoCapitalize="characters"
                      textContentType="none"
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verificar Código</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSendCode}
                    disabled={isLoading}
                    activeOpacity={0.7}>
                    <Text style={styles.resendButtonText}>
                      Reenviar código
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(1)}
                    activeOpacity={0.7}>
                    <Text style={styles.backButtonText}>Cambiar correo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e88e5',
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: 140,
    height: 140,
  },
  formContainer: {
    width: '100%',
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#1e88e5',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 56,
    height: 64,
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderRadius: 12,
    borderColor: '#2a2a2a',
    borderWidth: 2,
  },
  otpInputFilled: {
    borderColor: '#1e88e5',
    backgroundColor: '#1a1a2a',
  },
  secondaryActions: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendButton: {
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#1e88e5',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default RecoveryPassword;
