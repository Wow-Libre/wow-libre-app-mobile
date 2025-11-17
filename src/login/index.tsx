import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Images} from '../constant';

const LoginScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={{
                  uri: Images.WOW_ICON,
                }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Wow Libre</Text>
            <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                style={[
                  styles.input,
                  usernameFocused && styles.inputFocused,
                ]}
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('RecoveryPassword')}
              style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}>
            <Text style={styles.registerButtonText}>
              ¿No tienes cuenta? <Text style={styles.registerButtonBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

          {/* FOOTER */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerBrand}>@WowLibre</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLink}>www.wowlibre.com</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Desarrollamos soluciones innovadoras para la comunidad gaming.
            </Text>
            <Text style={styles.footerText}>
              Mejoramos la experiencia de juego con software avanzado.
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    width: '100%',
    height: 56,
    borderColor: '#374151',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    fontSize: 16,
    color: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#1e88e5',
    borderWidth: 2,
    backgroundColor: '#1f1f1f',
    shadowColor: '#1e88e5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6b7280',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  registerButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  registerButtonBold: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#1f1f1f',
  },
  footerBrand: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  footerLink: {
    color: '#60a5fa',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '400',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
    paddingHorizontal: 16,
    fontWeight: '400',
  },
});

export default LoginScreen;
