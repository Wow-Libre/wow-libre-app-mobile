import uuid from 'react-native-uuid';
import {GenericResponseDto, InternalServerError} from '../dto/generic';
import {BASE_URL, BASE_URL_TRANSACTION} from '../configs/configs';
import {LoginData} from '../dto/login';
import {ExistEmailModel} from '../models/ExistEmailModel';
import {AccountsDto} from '../models/AccountModel';
import {Characters} from '../models/CharacterModel';

/**
 * ES: Obtiene los datos del usuario asociado con el JWT.
 * @param jwt - El token JWT para autorización.
 * @returns Promesa que resuelve con el modelo del usuario (`UserDetailDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getUser = async (jwt: string): Promise<UserDetailDto> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL}/api/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
        transaction_id: transactionId,
      },
    });

    const responseData = await response.json();

    if (response.ok && response.status === 200) {
      return responseData.data;
    } else if (response.status === 404 || response.status === 409) {
      const badRequestError: GenericResponseDto<void> = responseData;
      throw new Error(`Error: ${badRequestError.message}`);
    } else {
      const errorMessage = await response.text();
      throw new Error(
        `An error occurred while trying to register data: ${errorMessage}`,
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Please try again later, services are not available.');
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`,
      );
    }
  }
};

export interface UserDetailDto {
  id?: number;
  email?: string;
  username?: string;
  avatar_url?: string;
  language?: string;
  is_admin?: boolean;
  isAdmin?: boolean;
  [key: string]: any; // Para campos adicionales que pueda devolver la API
}

/**
 * ES: Solicita un código de recuperación de contraseña.
 * @param email - El correo electrónico del usuario.
 * @returns Promesa que resuelve con la respuesta genérica.
 * @throws Error - Lanza errores específicos según la respuesta del servidor.
 */
export const recoverPassword = async (
  email: string,
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(
      `${BASE_URL}/api/account/password-recovery/request?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(`${errorGeneric.message}`);
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Please try again later, services are not available.`);
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

/**
 * ES: Valida el código de recuperación de contraseña.
 * @param email - El correo electrónico del usuario.
 * @param code - El código de verificación.
 * @param language - El idioma de la aplicación.
 * @returns Promesa que resuelve con la respuesta genérica.
 * @throws Error - Lanza errores específicos según la respuesta del servidor.
 */
export const validateRecoverPassword = async (
  email: string,
  code: string,
  language: string,
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(
      `${BASE_URL}/api/account/password-recovery/confirm?email=${encodeURIComponent(email)}&code=${code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          'Accept-Language': language,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(`${errorGeneric.message}`);
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Please try again later, services are not available.`);
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

/**
 * ES: Valida el código de confirmación de email.
 * @param jwt - El token JWT para autorización.
 * @param code - El código de verificación.
 * @returns Promesa que resuelve con la respuesta genérica.
 * @throws Error - Lanza errores específicos según la respuesta del servidor.
 */
export const validateMail = async (
  jwt: string,
  code: string,
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(
      `${BASE_URL}/api/account/email/confirmation?code=${code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          Authorization: 'Bearer ' + jwt,
        },
      },
    );

    if (response.status === 200 || response.status === 204) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const responseData: GenericResponseDto<void> = await response.json();
      throw new Error(`${responseData.message}`);
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Please try again later, services are not available.`);
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

/**
 * ES: Cambia la contraseña del usuario.
 * @param password - La contraseña actual del usuario.
 * @param newPassword - La nueva contraseña del usuario.
 * @param jwt - El token JWT para autorización.
 * @returns Promesa que resuelve con void.
 * @throws Error - Lanza errores específicos según la respuesta del servidor.
 */
export const changePasswordUser = async (
  password: string,
  newPassword: string,
  jwt: string,
): Promise<void> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL}/api/account/user-password/change`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        password: password,
        new_password: newPassword,
      }),
    });

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status === 401) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId,
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
      throw new Error(`Please try again later, services are not available.`);
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
 * Realiza el login del usuario con username y password.
 * @param userName - Nombre de usuario o email
 * @param password - Contraseña del usuario
 * @returns Promise con los datos del usuario logueado (LoginData)
 */
export const login = async (
  userName: string,
  password: string,
): Promise<LoginData> => {
  const requestBody: {
    username: string;
    password: string;
  } = {
    username: userName,
    password: password,
  };

  const transactionId = uuid.v4();

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<LoginData> = await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(`${errorGeneric.message} - TransactionId: ${transactionId}`);
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Please try again later, services are not available.');
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

/**
 * ES: Obtiene todas las cuentas asociadas con el cliente, paginadas y filtradas por servidor y nombre de usuario.
 * @param jwt - El token JWT para autorización.
 * @param page - Página actual para paginación (por defecto 0).
 * @param size - Número de elementos por página (por defecto 10).
 * @param realm - Filtro opcional por realm.
 * @param username - Filtro opcional por nombre de usuario.
 * @returns Promesa que resuelve con los datos de cuentas (`AccountsDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getAccounts = async (
  jwt: string,
  page: number = 0,
  size: number = 10,
  realm: string | null = null,
  username: string | null = null,
): Promise<AccountsDto> => {
  const transactionId = uuid.v4();

  try {
    const realmParam = realm ? encodeURIComponent(realm) : '';
    const usernameParam = username ? encodeURIComponent(username) : '';

    const response = await fetch(
      `${BASE_URL}/api/account/game/available?size=${size}&page=${page}&username=${usernameParam}&realm=${realmParam}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + jwt,
          transaction_id: transactionId,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<AccountsDto> = await response.json();
      return responseData.data;
    } else if (response.status === 401) {
      throw new InternalServerError(
        'Token expiration',
        response.status,
        transactionId,
      );
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
        transactionId,
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
 * Obtiene los personajes de una cuenta específica en un servidor.
 * @param jwt - El token JWT para autorización.
 * @param accountId - ID de la cuenta del juego.
 * @param serverId - ID del servidor.
 * @returns Promesa que resuelve con los personajes (Characters).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getCharacters = async (
  jwt: string,
  accountId: number,
  serverId: number,
): Promise<Characters> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(
      `${BASE_URL}/api/characters?account_id=${accountId}&server_id=${serverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + jwt,
          transaction_id: transactionId,
        },
      },
    );

    const responseData: GenericResponseDto<Characters> = await response.json();

    if (response.ok && response.status === 200) {
      return responseData.data;
    }

    throw new Error('It was not possible to obtain your characters');
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Please try again later, services are not available.');
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `It was not possible to obtain your characters: ${error.message}`,
      );
    }
  }
};

/**
 * Obtiene los puntos disponibles de la máquina para una cuenta y servidor.
 * @param token - El token JWT para autorización.
 * @param accountId - ID de la cuenta del juego.
 * @param serverId - ID del servidor.
 * @returns Promesa que resuelve con los puntos disponibles (MachineCoinsDto).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getPoints = async (
  token: string,
  accountId: number,
  serverId: number,
): Promise<MachineCoinsDto> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(
      `${BASE_URL}/api/machine/points?server_id=${serverId}&account_id=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<MachineCoinsDto> =
        await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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
 * Reclama el premio de la máquina para un personaje específico.
 * @param serverId - ID del servidor.
 * @param accountId - ID de la cuenta del juego.
 * @param characterId - ID del personaje.
 * @param token - El token JWT para autorización.
 * @param language - Idioma para la respuesta (por defecto 'es').
 * @returns Promesa que resuelve con el resultado de la máquina (MachineDto).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const claimMachine = async (
  serverId: number,
  accountId: number,
  characterId: number,
  token: string,
  language: string = 'es',
): Promise<MachineDto> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(`${BASE_URL}/api/machine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
        'Accept-Language': language,
      },
      body: JSON.stringify({
        server_id: serverId,
        account_id: accountId,
        character_id: characterId,
      }),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<MachineDto> =
        await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

// DTOs para la máquina
export interface MachineCoinsDto {
  coins: number;
}

export interface MachineDto {
  logo: string;
  name: string;
  type: string;
  message: string;
  winner: boolean;
  itemId?: number;
  itemEntry?: number;
  item_id?: number;
  item_entry?: number;
  id?: number;
  entry?: number;
  [key: string]: any; // Permitir otros campos de la API
}

/**
 * Obtiene los teleports disponibles para una raza y reino específicos.
 * @param raceId - ID de la raza del personaje.
 * @param realmId - ID del reino/servidor.
 * @param token - El token JWT para autorización.
 * @returns Promesa que resuelve con la lista de teleports disponibles (Teleport[]).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getTeleports = async (
  raceId: number,
  realmId: number,
  token: string,
): Promise<Teleport[]> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(
      `${BASE_URL}/api/teleport?raceId=${raceId}&realmId=${realmId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Teleport[]> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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
 * Realiza el teletransporte de un personaje a un destino específico.
 * @param token - El token JWT para autorización.
 * @param accountId - ID de la cuenta del juego.
 * @param characterId - ID del personaje.
 * @param realmId - ID del reino/servidor.
 * @param teleportId - ID del teleport destino.
 * @returns Promesa que resuelve con la lista de teleports actualizada (Teleport[]).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const teleport = async (
  token: string,
  accountId: number,
  characterId: number,
  realmId: number,
  teleportId: number,
): Promise<Teleport[]> => {
  const transactionId = uuid.v4();

  try {
    const response = await fetch(`${BASE_URL}/api/teleport/character`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        teleport_id: teleportId,
        character_id: characterId,
        account_id: accountId,
        realm_id: realmId,
      }),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Teleport[]> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

// DTOs para teleports
export interface Teleport {
  id: number;
  img_url: string;
  name: string;
  position_x: number;
  position_y: number;
  position_z: number;
  map: number;
  orientation: number;
  zone: number;
  area: number;
  faction: string;
}

// Premium APIs
export const getBenefitsPremium = async (
  language: string,
  token: string,
  serverId: number,
): Promise<SubscriptionBenefits> => {
  try {
    const transactionId = uuid.v4();
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/subscription/benefits?server_id=${serverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          'Accept-Language': language,
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<SubscriptionBenefits> =
        await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`,
      );
    }
  } catch (error: any) {
    throw new Error(`An unexpected error has occurred: ${error.message}`);
  }
};

export const claimBenefitsPremium = async (
  serverId: number,
  accountId: number,
  characterId: number,
  benefitId: number,
  language: string,
  token: string,
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/subscription/claim-benefits`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          'Accept-Language': language,
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          character_id: characterId,
          benefit_id: benefitId,
          account_id: accountId,
          server_id: serverId,
        }),
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

export const getSubscriptionActive = async (
  token: string,
): Promise<boolean> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/subscription`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<boolean> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
      );
    }
  } catch (error: any) {
    return false;
  }
};

// DTOs para Premium
export interface SubscriptionBenefits {
  benefits: SubscriptionsBenefit[];
  size: number;
}

export interface SubscriptionsBenefit {
  id: number;
  img: string;
  name: string;
  description: string;
  reactivable: boolean;
  command: string;
  btn_txt: string;
}

// Shop APIs
export const getProducts = async (
  language: string,
): Promise<Record<string, CategoryDetail[]>> => {
  try {
    const transactionId = uuid.v4();
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        'Accept-Language': language,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Record<string, CategoryDetail[]>> =
        await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`,
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the professions: ${error.message}`,
    );
  }
};

// DTOs para Shop
export interface CategoryDetail {
  id: number;
  name: string;
  description: string;
  disclaimer: string;
  products: Product[];
}

export interface Product {
  id: number;
  name: string;
  disclaimer: string;
  category: string;
  price: number;
  discount: number;
  discount_price: number;
  use_points: boolean;
  description: string;
  img_url: string;
  partner: string;
  reference_number: string;
}

export const getProduct = async (reference: string): Promise<ProductDetail> => {
  try {
    const transactionId = uuid.v4();
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/products/${reference}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<ProductDetail> =
        await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`,
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the professions: ${error.message}`,
    );
  }
};

export interface ProductDetail {
  id: number;
  name: string;
  disclaimer: string;
  category: string;
  price: number;
  discount: number;
  use_points: boolean;
  description: string;
  img_url: string;
  partner: string;
  server_id: number;
  reference_number: string;
  details: ProductDetailsModel[];
}

export interface ProductDetailsModel {
  id: number;
  product_id: number;
  title: string;
  description: string;
  img_url: string;
}

// Payment Methods API
export const getPaymentMethodsGateway = async (
  token: string,
): Promise<PaymentMethodsGatewayReponse[]> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/payment-method`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<PaymentMethodsGatewayReponse[]> =
        await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

export interface PaymentMethodsGatewayReponse {
  id: number;
  name: string;
  description?: string;
  img_url?: string;
  payment_type?: string;
  [key: string]: any;
}

// Buy Product API
export const buyProduct = async (
  accountId: number | null,
  token: string,
  isSubscription: boolean,
  reference: string | null,
  paymentType: string,
  realmId: number,
): Promise<BuyRedirectDto> => {
  const transactionId = uuid.v4();

  try {
    const requestBody: {
      is_subscription: boolean;
      account_id: number | null;
      product_reference: string | null;
      payment_type: string;
      realm_id: number;
    } = {
      is_subscription: isSubscription,
      account_id: accountId,
      product_reference: reference,
      payment_type: paymentType,
      realm_id: realmId,
    };

    const response = await fetch(`${BASE_URL_TRANSACTION}/api/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<BuyRedirectDto> =
        await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

export interface BuyRedirectDto {
  redirect: string;
  confirmation_url: string;
  response_url: string;
  buyer_email: string;
  currency: string;
  tax_return_base: string;
  tax: string;
  amount: string;
  reference_code: string;
  description: string;
  is_payment: boolean;
  payu: BuyRedirectPayuDto;
}

export interface BuyRedirectPayuDto {
  account_id: string;
  merchant_id: string;
  signature: string;
  test: string;
}

// Transactions APIs
export const getTransactions = async (
  token: string,
  page: number,
  size: number,
): Promise<TransactionDto> => {
  try {
    const transactionId = uuid.v4();
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/transactions?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<TransactionDto> =
        await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`,
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the professions: ${error.message}`,
    );
  }
};

export const getTransactionReferenceNumber = async (
  token: string,
  referenceNumber: string,
): Promise<Transaction> => {
  try {
    const transactionId = uuid.v4();
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/transactions/${referenceNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          transaction_id: transactionId,
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Transaction> =
        await response.json();
      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`,
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the professions: ${error.message}`,
    );
  }
};

export interface Transaction {
  id: number;
  price: number;
  currency: string;
  status: string;
  progress?: number;
  creation_date: string;
  reference_number: string;
  product_name: string;
  logo: string;
  user_id?: number;
  account_id?: number;
  realm_id?: number;
  payment_method?: string;
  credit_points?: boolean;
  send?: boolean;
  reference_payment?: string | null;
  subscription?: boolean;
  product_id?: {
    id: number;
    name: string;
    product_category_id?: {
      id: number;
      name: string;
      description: string;
      disclaimer: string;
    };
    disclaimer?: string;
    description?: string;
    image_url?: string;
    realm_name?: string;
    reference_number?: string;
  };
}

export interface TransactionDto {
  transactions: Transaction[];
  size: number;
}

// Wallet APIs
export const getAmountWallet = async (token: string): Promise<number> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/wallet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<number> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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

export const getAmountWalletVoting = async (token: string): Promise<number> => {
  const transactionId = uuid.v4();
  try {
    const response = await fetch(`${BASE_URL}/api/voting/wallet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        transaction_id: transactionId,
        Authorization: 'Bearer ' + token,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<number> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId,
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