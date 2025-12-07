import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ModalSelector from 'react-native-modal-selector';
import {CountryModel} from '../../api/models/CountryModel';
import {StepProps} from '../types';
import { SERVER_NAME } from '../../api/configs/configs';

interface PersonalDataStepProps extends StepProps {
  countryOptions: CountryModel[];
  formatDateForDisplay: (dateString: string) => string;
  calculateAge: (birthDateString: string) => number;
  onCancel?: () => void;
}

const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  countryOptions,
  formatDateForDisplay,
  calculateAge,
  onCancel,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    onUpdateFormData({birthdate: formattedDate});
    hideDatePicker();
  };

  const validateStep = () => {
    if (!formData.selectedCountry) {
      Alert.alert('Error', 'Por favor selecciona tu país de residencia.');
      return false;
    }
    if (!formData.birthdate) {
      Alert.alert('Error', 'Por favor selecciona tu fecha de nacimiento.');
      return false;
    }

    // Validar que la persona sea mayor de 13 años
    const age = calculateAge(formData.birthdate);
    if (age < 13) {
      Alert.alert(
        'Error',
        `Debes ser mayor de 13 años para registrarte en ${SERVER_NAME}.`,
      );
      return false;
    }

    return true;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.subTitle}>
        ¡Toda la información que nos compartas en {SERVER_NAME} es como el
        ingrediente especial de tu experiencia alucinante! Cuanto más sepamos,
        mejor podremos hacerte vivir algo realmente extraordinario. Así que,
        ¡compártenos esos datos y prepárate para algo fuera de serie!
      </Text>

      <Text style={styles.label}>País de residencia:</Text>
      <ModalSelector
        data={countryOptions}
        initValue={formData.selectedCountry || 'Selecciona tu país'}
        onChange={option => {
          console.log('País seleccionado:', option);
          onUpdateFormData({selectedCountry: option.value});
        }}
        style={styles.selector}
        selectStyle={styles.selectStyle}
        selectTextStyle={styles.selectTextStyle}
      />

      <Text style={styles.label}>Fecha de nacimiento:</Text>
      <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
        <Text
          style={[
            styles.dateText,
            !formData.birthdate && styles.placeholderText,
          ]}>
          {formData.birthdate
            ? formatDateForDisplay(formData.birthdate)
            : 'Selecciona tu fecha'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="spinner"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

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
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}>
            <Text style={styles.buttonText}>Cancelar</Text>
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
  dateInput: {
    width: '100%',
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  placeholderText: {
    color: '#aaa',
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
  cancelButton: {
    backgroundColor: '#888',
  },
});

export default PersonalDataStep;

