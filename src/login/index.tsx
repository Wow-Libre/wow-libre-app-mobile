import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Images from '../constant';

const LoginScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: Images.WOW_ICON,
        }}
      />
      <Text style={styles.title}>Wow Libre</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Loguearme</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity>
          <Text style={styles.linkText}>Olvidar Clave</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Registrarme</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.pageWebContainer}>
          <Text style={styles.pageWeb}>🌐 www.wowlibre.com</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          World of Warcraft® and Blizzard Entertainment® are trademarks or
          registered trademarks of Blizzard Entertainment in the United States
          and/or other countries.
        </Text>
        <Text style={styles.footerText}>
          These terms and all related materials, logos, and images are copyright
          © Blizzard Entertainment. This site is in no way associated with or
          endorsed by Blizzard Entertainment®.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Fondo negro
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#ffffff',
  },
  input: {
    width: '80%',
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
  linksContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#1e88e5', // Azul sutil
    fontSize: 17,
    textDecorationLine: 'underline',
    marginVertical: 4,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#1e88e5', // Azul
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 50,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  pageWebContainer: {
    backgroundColor: '#1e88e5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 10,
  },
  pageWeb: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;
