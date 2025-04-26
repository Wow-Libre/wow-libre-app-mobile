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
} from 'react-native';
import {Images} from '../constant';

const RecoveryPassword = ({}: {navigation: any}): React.JSX.Element => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Image style={styles.image} source={{uri: Images.RECOVER_ICON}} />

        {step === 1 && (
          <>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo para enviarte un código de verificación
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>Enviar Código</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Código de Verificación</Text>
            <Text style={styles.subtitle}>
              Ingresa el código de 5 dígitos que te enviamos
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Verificar Código</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep(1)}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2979ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2979ff',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#bbb',
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 58,
    backgroundColor: '#1f1f1f',
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    borderRadius: 10,
    borderColor: '#444',
    borderWidth: 1,
  },
});

export default RecoveryPassword;
