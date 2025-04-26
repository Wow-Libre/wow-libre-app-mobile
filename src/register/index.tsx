import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ModalSelector from 'react-native-modal-selector';
import {getAvailableCountries} from '../api/external';
import {CountryModel} from '../api/models/CountryModel';
import {Configs, Images} from '../constant';
import {registerAccountWeb} from '../api/internal';
import {RecaptchaRef} from 'react-native-recaptcha-that-works';
import Recaptcha from 'react-native-recaptcha-that-works';

const defaultCountryOptions: CountryModel[] = [
  {value: 'Otro', label: 'Otro', language: 'pt'},
  {value: 'Others', label: 'Others', language: 'en'},
];

const RegisterScreen = (): React.JSX.Element => {
  const [step, setStep] = useState(1); // Controla en qué paso estamos
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [countryOptions, setCountryOptions] = useState<CountryModel[]>(
    defaultCountryOptions,
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cellphone, setCellPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [offersAccepted, setOffersAccepted] = useState(false);
  const recaptcha = useRef<RecaptchaRef>(null);
  const [captchToken, setCaptcha] = useState('');

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const onVerify = (token: any) => {
    setCaptcha(token);
  };

  const onExpire = () => {
    console.warn('expired!');
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setBirthdate(formattedDate);
    hideDatePicker();
  };

  const handleRegister = async () => {
    if (!recaptcha.current) {
      return;
    }

    recaptcha.current.open();

    try {
      const userDateOfBirth = birthdate;

      const formattedDateOfBirth = userDateOfBirth
        ? !isNaN(new Date(userDateOfBirth).getTime())
          ? new Date(userDateOfBirth).toISOString().split('T')[0]
          : new Date().toISOString()
        : new Date().toISOString();

      const requestBody = {
        country: selectedCountry,
        date_of_birth: formattedDateOfBirth,
        first_name: firstName,
        last_name: lastName,
        cell_phone: cellphone,
        email: email,
        password: password,
        language: 'es',
        token: captchToken,
      };

      await registerAccountWeb(requestBody, 'ES');
    } catch (error: any) {
      return;
    } finally {
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCountryOptions = await getAvailableCountries();

        const formattedCountries = fetchedCountryOptions.map(country => ({
          key: country.value,
          label: country.label,
          value: country.value,
          language: country.language,
        }));
        setCountryOptions(formattedCountries);
      } catch (error) {
        console.error('Error obteniendo países:', error);
      }
    };
    fetchData();
  }, []);

  const validateStep1 = () => {
    if (!selectedCountry) {
      Alert.alert('Error', 'Por favor selecciona tu país de residencia.');
      return false;
    }
    if (!birthdate) {
      Alert.alert('Error', 'Por favor selecciona tu fecha de nacimiento.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (lastName.length < 5) {
      Alert.alert('Error', 'El nombre debe tener al menos 5 caracteres.');
      return false;
    }
    if (firstName.length < 5) {
      Alert.alert('Error', 'El apellido debe tener al menos 5 caracteres.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return false;
    }
    if (cellphone.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido.');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!termsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones.');
      return false;
    }
    if (!offersAccepted) {
      Alert.alert('Error', 'Debes aceptar recibir ofertas especiales.');
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: Images.WOW_ICON,
        }}
      />
      <Text style={styles.title}>Wow Libre</Text>

      {/* PASO 1: Datos Personales */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.subTitle}>
            ¡Toda la información que nos compartas en Wow Libre es como el
            ingrediente especial de tu experiencia alucinante! Cuanto más
            sepamos, mejor podremos hacerte vivir algo realmente extraordinario.
            Así que, ¡compártenos esos datos y prepárate para algo fuera de
            serie!
          </Text>

          <Text style={styles.label}>País de residencia:</Text>
          <ModalSelector
            data={countryOptions}
            initValue={selectedCountry || 'Selecciona tu país'}
            onChange={option => {
              console.log('País seleccionado:', option);
              setSelectedCountry(option.value);
            }}
            style={styles.selector}
            selectStyle={styles.selectStyle}
            selectTextStyle={styles.selectTextStyle}
          />

          <Text style={styles.label}>Fecha de nacimiento:</Text>
          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text
              style={[styles.dateText, !birthdate && styles.placeholderText]}>
              {birthdate || 'Selecciona tu fecha'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            display="spinner"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validateStep1()) {
                  setStep(2);
                }
              }}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.subTitle}>
            Es posible que se utilice tu nombre real en el futuro para verificar
            tu identidad cuando te pongas en contacto con WowLibre. Por defecto,
            tu nombre real permanecerá oculto para otros usuarios.
          </Text>
          <Text style={styles.label}>Ingrese sus nombres:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre personales"
            placeholderTextColor="#aaa"
            keyboardType="default"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Ingrese sus apellidos:</Text>
          <TextInput
            style={styles.input}
            placeholder="Apellido personales"
            placeholderTextColor="#aaa"
            keyboardType="default"
            value={lastName}
            onChangeText={setLastname}
          />

          {/* Contenedor de los botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validateStep2()) {
                  setStep(3);
                }
              }}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(1)}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* PASO 2: Credenciales */}
      {step === 3 && (
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
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Ingrese un número de teléfono:</Text>
          <TextInput
            style={styles.input}
            placeholder="+"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={cellphone}
            onChangeText={setCellPhone}
          />

          {/* Contenedor de los botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validateStep3()) {
                  setStep(4);
                }
              }}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.subTitle}>
            ¡Bienvenido a Wow Libre! Aceptar nuestras opciones te permite
            sumergirte en una experiencia personalizada llena de ofertas
            exclusivas, noticias emocionantes y mucho más.
          </Text>

          <View style={styles.checkboxContainer}>
            <Switch
              value={termsAccepted ?? false}
              onValueChange={newValue => setTermsAccepted(newValue)}
            />
            <Text style={styles.checkboxLabel}>
              He leído y acepto los Términos y condiciones
            </Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Switch
              value={offersAccepted ?? false}
              onValueChange={newValue => setOffersAccepted(newValue)}
            />
            <Text style={styles.checkboxLabel}>
              El correo de la cuenta recibirá ofertas especiales, noticias
            </Text>
          </View>
          {/* Contenedor de los botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validateStep4()) {
                  setStep(5);
                }
              }}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 5 && (
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
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirmar Contraseña:</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Contenedor de los botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(4)}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
            <Recaptcha
              ref={recaptcha}
              siteKey={Configs.KEY_GOOGLE_RECAPTCHA}
              baseUrl="http://www.wowlibre.com"
              onVerify={onVerify}
              onExpire={onExpire}
              size="normal"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center', // Centra todos los elementos
    paddingHorizontal: 20, // Asegura que haya padding horizontal para todos los elementos
  },
  buttonWrapper: {
    width: '100%', // Usa todo el ancho disponible
    alignItems: 'center', // Centra el botón horizontalmente
    marginTop: 20,
  },
  button: {
    width: '100%', // Hace que el botón tenga el mismo ancho que los inputs
    height: 50,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10, // Separación entre botones
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: '100%',
  },
  placeholderText: {
    color: '#aaa',
  },
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
  selector: {
    width: '100%',
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
  input: {
    width: '100%', // Hace que el input tenga el mismo ancho que los botones
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
    justifyContent: 'flex-start', // Los distribuye de forma equitativa
    width: '100%', // El ancho de los botones es consistente con los inputs
    marginTop: 20, // Añadimos un pequeño margen entre los botones
  },
  backButton: {
    backgroundColor: '#888',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#ffffff',
  },
});

export default RegisterScreen;
