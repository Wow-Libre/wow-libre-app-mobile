export interface RegisterFormData {
  selectedCountry: string;
  birthdate: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cellphone: string;
  termsAccepted: boolean;
  offersAccepted: boolean;
}

export interface StepProps {
  formData: RegisterFormData;
  onUpdateFormData: (data: Partial<RegisterFormData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

