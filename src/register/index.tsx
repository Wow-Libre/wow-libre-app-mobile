import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const RegisterScreen = (): React.JSX.Element => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Convierte a formato YYYY-MM-DD
    setBirthdate(formattedDate);
    hideDatePicker();
  };
  const countries = [
    {key: 0, label: 'Argentina'},
    {key: 1, label: 'Brasil'},
    {key: 2, label: 'Chile'},
    {key: 3, label: 'Colombia'},
    {key: 4, label: 'México'},
    {key: 5, label: 'Perú'},
    {key: 6, label: 'España'},
    {key: 7, label: 'Estados Unidos'},
  ];

  const handleRegister = () => {
    console.log('Registrando usuario...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      {/* Selector de país */}
      <Text style={styles.label}>País de residencia:</Text>
      <ModalSelector
        data={countries}
        initValue="Selecciona tu país"
        onChange={option => setSelectedCountry(option.label)}
        style={styles.selector}
        selectStyle={styles.selectStyle}
        selectTextStyle={styles.selectTextStyle}
      />
      <Text style={styles.selectedText}>
        {selectedCountry ? `Seleccionado: ${selectedCountry}` : 'Ninguno'}
      </Text>

      {/* Input de email */}
      <Text style={styles.label}>Correo electrónico:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ejemplo: usuario@mail.com"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
      />

      {/* Input de contraseña */}
      <Text style={styles.label}>Contraseña:</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#aaa"
        secureTextEntry
      />

      {/* Input para fecha de nacimiento */}
      <Text style={styles.label}>Fecha de nacimiento:</Text>
      <TouchableOpacity onPress={showDatePicker}>
        <TextInput
          style={styles.input}
          placeholder="Selecciona tu fecha"
          placeholderTextColor="#aaa"
          value={birthdate}
          editable={false}
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="spinner"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {/* Botón de registro */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Estilos mejorados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#ffffff',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontSize: 14,
    color: '#bbb',
    marginTop: 10,
  },
  selector: {
    width: '80%',
    marginBottom: 8,
  },
  selectStyle: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectTextStyle: {
    color: '#ffffff',
    fontSize: 16,
  },
  selectedText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
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
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#1e88e5',
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
});

export default RegisterScreen;
