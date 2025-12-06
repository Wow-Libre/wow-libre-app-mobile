import React, {useEffect, useState} from 'react';
import {Image, SafeAreaView, StyleSheet, Text} from 'react-native';
import {getAvailableCountries} from '../api/external';
import {CountryModel} from '../api/models/CountryModel';
import {Images} from '../constant';
import {registerAccountWeb} from '../api/internal';
import {RegisterFormData} from './types';
import PersonalDataStep from './steps/PersonalDataStep';
import NameDataStep from './steps/NameDataStep';
import CredentialsStep from './steps/CredentialsStep';
import TermsStep from './steps/TermsStep';
import PasswordStep from './steps/PasswordStep';
import { SERVER_NAME } from '../api/configs/configs';

const defaultCountryOptions: CountryModel[] = [
  {value: 'Otro', label: 'Otro', language: 'pt'},
  {value: 'Others', label: 'Others', language: 'en'},
];

const RegisterScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [step, setStep] = useState(1);
  const [countryOptions, setCountryOptions] = useState<CountryModel[]>(
    defaultCountryOptions,
  );

  const [formData, setFormData] = useState<RegisterFormData>({
    selectedCountry: '',
    birthdate: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cellphone: '',
    termsAccepted: false,
    offersAccepted: false,
  });

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Si aún no ha cumplido años este año, restar 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleUpdateFormData = (data: Partial<RegisterFormData>) => {
    setFormData(prev => ({...prev, ...data}));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleCancel = () => {
    navigation.navigate('Login');
  };

  const handleRegister = async (token: string): Promise<void> => {
    console.log('=== handleRegister llamado ===');
    console.log('Token recibido:', token ? 'Token presente' : 'Sin token');
    
    const userDateOfBirth = formData.birthdate;

    const formattedDateOfBirth = userDateOfBirth
      ? !isNaN(new Date(userDateOfBirth).getTime())
        ? new Date(userDateOfBirth).toISOString().split('T')[0]
        : new Date().toISOString()
      : new Date().toISOString();

    const requestBody = {
      country: formData.selectedCountry,
      date_of_birth: formattedDateOfBirth,
      first_name: formData.firstName,
      last_name: formData.lastName,
      cell_phone: formData.cellphone,
      email: formData.email,
      password: formData.password,
      language: 'es',
      token: token,
    };

    console.log('Request body preparado:', {
      ...requestBody,
      password: '***',
      token: token ? '***' : 'Sin token',
    });

    try {
      console.log('Llamando a registerAccountWeb...');
      const result = await registerAccountWeb(requestBody, 'ES');
      console.log('registerAccountWeb exitoso:', result);
      // Si el registro es exitoso, navegar al perfil
      console.log('Navegando a Profile...');
      navigation.navigate('Profile');
    } catch (error: any) {
      console.error('=== ERROR en handleRegister ===');
      console.error('Error completo:', error);
      console.error('Error message:', error?.message);
      // Re-lanzar el error para que el componente PasswordStep lo maneje
      throw error;
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PersonalDataStep
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
            onNext={handleNext}
            countryOptions={countryOptions}
            formatDateForDisplay={formatDateForDisplay}
            calculateAge={calculateAge}
            onCancel={handleCancel}
          />
        );
      case 2:
        return (
          <NameDataStep
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <CredentialsStep
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <TermsStep
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <PasswordStep
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
            onBack={handleBack}
            onRegister={handleRegister}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: Images.WOW_ICON,
        }}
      />
      <Text style={styles.title}>{SERVER_NAME}</Text>
      {renderStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
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
});

export default RegisterScreen;
