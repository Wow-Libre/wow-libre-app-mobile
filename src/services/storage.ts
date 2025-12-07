import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoginData} from '../api/dto/login';

const STORAGE_KEYS = {
  JWT: '@wowlibre:jwt',
  REFRESH_TOKEN: '@wowlibre:refresh_token',
  USER_DATA: '@wowlibre:user_data',
  EXPIRATION_DATE: '@wowlibre:expiration_date',
};

/**
 * Guarda los datos del usuario después del login/registro
 */
export const saveUserData = async (loginData: LoginData): Promise<void> => {
  try {
    // Normalizar expiration_date: convertir timestamp a string si es necesario
    const expirationDate = typeof loginData.expiration_date === 'number' 
      ? loginData.expiration_date.toString() 
      : loginData.expiration_date;

    // Normalizar is_admin: puede venir como isAdmin o is_admin
    const isAdmin = loginData.is_admin ?? loginData.isAdmin ?? false;

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.JWT, loginData.jwt),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refresh_token),
      AsyncStorage.setItem(STORAGE_KEYS.EXPIRATION_DATE, expirationDate),
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
        id: loginData.id,
        avatar_url: loginData.avatar_url,
        language: loginData.language,
        pending_validation: loginData.pending_validation,
        is_admin: isAdmin,
      })),
    ]);
    console.log('Datos del usuario guardados exitosamente');
  } catch (error: any) {
    console.error('Error al guardar datos del usuario:', error);
    // Si AsyncStorage no está disponible, solo logueamos el error pero no bloqueamos el flujo
    if (error?.message?.includes('AsyncStorage') || error?.message?.includes('NativeModule')) {
      console.warn('AsyncStorage no está disponible, pero el login fue exitoso');
      return; // No lanzamos error para no bloquear la navegación
    }
    throw new Error('No se pudieron guardar los datos del usuario');
  }
};

/**
 * Obtiene el JWT almacenado
 */
export const getJWT = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.JWT);
  } catch (error) {
    console.error('Error al obtener JWT:', error);
    return null;
  }
};

/**
 * Obtiene el refresh token almacenado
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error al obtener refresh token:', error);
    return null;
  }
};

/**
 * Obtiene todos los datos del usuario almacenados
 */
export const getUserData = async (): Promise<LoginData | null> => {
  try {
    const [jwt, refreshToken, expirationDate, userDataStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.JWT),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.EXPIRATION_DATE),
      AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
    ]);

    if (!jwt || !refreshToken || !userDataStr) {
      return null;
    }

    const userData = JSON.parse(userDataStr);
    return {
      id: userData.id,
      jwt,
      refresh_token: refreshToken,
      expiration_date: expirationDate || '',
      avatar_url: userData.avatar_url || '',
      language: userData.language || 'es',
      pending_validation: userData.pending_validation || false,
      is_admin: userData.is_admin || false,
    };
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

/**
 * Verifica si el token está expirado
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expirationDateStr = await AsyncStorage.getItem(STORAGE_KEYS.EXPIRATION_DATE);
    if (!expirationDateStr) {
      return true;
    }

    const expirationDate = new Date(expirationDateStr);
    const now = new Date();
    return now >= expirationDate;
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
};

/**
 * Limpia todos los datos de autenticación almacenados
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.JWT),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.EXPIRATION_DATE),
    ]);
    console.log('Datos del usuario eliminados exitosamente');
  } catch (error) {
    console.error('Error al eliminar datos del usuario:', error);
    throw new Error('No se pudieron eliminar los datos del usuario');
  }
};

