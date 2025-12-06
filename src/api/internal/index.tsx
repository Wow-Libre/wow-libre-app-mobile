import uuid from 'react-native-uuid';
import {GenericResponseDto, InternalServerError} from '../dto/generic';
import {BASE_URL} from '../configs/configs';
import {LoginData} from '../dto/login';
import {ExistEmailModel} from '../models/ExistEmailModel';

/**
 * Obtiene la lista de países disponibles mediante una llamada a la API.
 * - Genera un `transactionId` único para identificar la solicitud.
 * - Realiza una solicitud `GET` al endpoint `/api/resources/country` para obtener los países.
 * - Si la respuesta es exitosa (status 200), devuelve los datos de países obtenidos de la API.
 * - En caso de error o si la respuesta no es exitosa, retorna una lista de opciones por defecto.
 *
 * @returns {Promise<CountryModel[]>} Lista de países disponibles o valores predeterminados en caso de error.
 */

export const registerAccountWeb = async (
  userData: {
    country: string;
    date_of_birth: string;
    first_name: string;
    last_name: string;
    cell_phone: string;
    email: string;
    password: string;
    language: string;
    token: string;
  },
  language: string,
): Promise<LoginData> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL}/api/account/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        'Accept-Language': language,
      },
      body: JSON.stringify(userData),
    });

    if (response.ok && response.status === 201) {
      const responseData = await response.json();

      return responseData.data;
    } else if (response.status === 400) {
      throw new Error(
        `Please contact support, it seems the fields are invalid - TransactionId: ${transactionId}`,
      );
    } else {
      const badRequestError: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${badRequestError.message}`,
        badRequestError.code,
        badRequestError.transaction_id,
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Please try again later, services are not available.');
    } else if (error instanceof InternalServerError) {
      throw error;
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`,
      );
    }
  }
};

/**
 * Valida si un correo electrónico ya existe en el sistema.
 * @param email - Correo electrónico a validar
 * @returns Promise con el resultado de la validación
 */
export const existEmail = async (
  email: string,
): Promise<ExistEmailModel> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(
      `${BASE_URL}/api/account/search?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
        },
      },
    );

    const responseData: GenericResponseDto<ExistEmailModel> =
      await response.json();

    if (response.ok && response.status === 200) {
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - TransactionId: ${transactionId}`,
      );
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`, error);
    throw new Error(
      `No fue posible validar el correo electrónico del cliente: ${error.message}`,
    );
  }
};

/**
 * Valida si un número de teléfono ya existe en el sistema.
 * @param phone - Número de teléfono a validar
 * @returns Promise con el resultado de la validación
 */
export const existPhone = async (
  phone: string,
): Promise<ExistEmailModel> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(
      `${BASE_URL}/api/account/search?cell_phone=${phone}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
        },
      },
    );

    const responseData: GenericResponseDto<ExistEmailModel> =
      await response.json();

    if (response.ok && response.status === 200) {
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - TransactionId: ${transactionId}`,
      );
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`, error);
    throw new Error(
      `No fue posible validar el teléfono del cliente: ${error.message}`,
    );
  }
};
