import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Modal,
} from 'react-native';
import {getUserData, clearUserData, getJWT} from '../services/storage';
import {
  getAmountWallet,
  getAmountWalletVoting,
  getUser,
  changePasswordUser,
} from '../api/internal/index';

const HomeScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [userData, setUserData] = useState<any>(null);
  const [userAccountInfo, setUserAccountInfo] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [votingPoints, setVotingPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (!data) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }
      setUserData(data);

      // Cargar información de la cuenta desde la API
      const jwt = await getJWT();
      if (jwt) {
        try {
          const accountInfo = await getUser(jwt);
          setUserAccountInfo(accountInfo);
        } catch (error: any) {
          console.error('Error al cargar información de la cuenta:', error);
          // No mostramos error al usuario, solo usamos los datos del storage
        }

        try {
          const walletBalance = await getAmountWallet(jwt);
          setBalance(walletBalance);
        } catch (error: any) {
          console.error('Error al cargar saldo:', error);
          setBalance(0);
        }

        try {
          const votingBalance = await getAmountWalletVoting(jwt);
          setVotingPoints(votingBalance);
        } catch (error: any) {
          console.error('Error al cargar puntos de votación:', error);
          setVotingPoints(0);
        }
      }
    } catch (error: any) {
      console.error('Error al cargar datos del usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadUserData();
  };

  const formatBalance = (amount: number) => {
    // Formatear el número con separadores de miles
    const formattedAmount = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    
    return `${formattedAmount} Puntos`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {/* Header con Avatar y Nombre */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  userAccountInfo?.avatar_url ||
                  userData?.avatar_url ||
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Bienvenido</Text>
              <Text style={styles.userEmail}>
                {userAccountInfo?.email ||
                  userAccountInfo?.username ||
                  userData?.email ||
                  'Usuario'}
              </Text>
              {userAccountInfo?.username &&
                userAccountInfo?.username !== userAccountInfo?.email && (
                  <Text style={styles.userUsername}>
                    @{userAccountInfo.username}
                  </Text>
                )}
            </View>
          </View>
        </View>

        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo de la Cuenta</Text>
          <Text style={styles.balanceAmount}>
            {balance !== null ? formatBalance(balance) : 'Cargando...'}
          </Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceSubtext}>
                {balance === 0 ? 'No hay saldo disponible' : 'Saldo disponible'}
              </Text>
            </View>
            {votingPoints !== null && (
              <View style={styles.votingPointsRow}>
                <Text style={styles.votingPointsLabel}>Puntos de Votación:</Text>
                <Text style={styles.votingPointsValue}>
                  {votingPoints.toLocaleString()} pts
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botones de Navegación */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>Navegación</Text>

          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Accounts')}>
            <View style={styles.navButtonContent}>
              <View style={[styles.navIcon, styles.accountsIcon]}>
                <Text style={styles.navIconText}>🎮</Text>
              </View>
              <View style={styles.navButtonTextContainer}>
                <Text style={styles.navButtonTitle}>Mis Cuentas</Text>
                <Text style={styles.navButtonSubtitle}>
                  Gestiona tus cuentas de juego
                </Text>
              </View>
              <Text style={styles.navArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Shop')}>
            <View style={styles.navButtonContent}>
              <View style={[styles.navIcon, styles.shopIcon]}>
                <Text style={styles.navIconText}>🛒</Text>
              </View>
              <View style={styles.navButtonTextContainer}>
                <Text style={styles.navButtonTitle}>Tienda</Text>
                <Text style={styles.navButtonSubtitle}>
                  Explora nuestra tienda
                </Text>
              </View>
              <Text style={styles.navArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Transactions')}>
            <View style={styles.navButtonContent}>
              <View style={[styles.navIcon, styles.transactionsIcon]}>
                <Text style={styles.navIconText}>📋</Text>
              </View>
              <View style={styles.navButtonTextContainer}>
                <Text style={styles.navButtonTitle}>Transacciones</Text>
                <Text style={styles.navButtonSubtitle}>
                  Historial de compras
                </Text>
              </View>
              <Text style={styles.navArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={() => setIsChangePasswordModalVisible(true)}>
            <View style={styles.navButtonContent}>
              <View style={[styles.navIcon, styles.passwordIcon]}>
                <Text style={styles.navIconText}>🔒</Text>
              </View>
              <View style={styles.navButtonTextContainer}>
                <Text style={styles.navButtonTitle}>Cambiar Contraseña</Text>
                <Text style={styles.navButtonSubtitle}>
                  Actualiza tu contraseña
                </Text>
              </View>
              <Text style={styles.navArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={async () => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Estás seguro de que deseas cerrar sesión?',
              [
                {text: 'Cancelar', style: 'cancel'},
                {
                  text: 'Cerrar Sesión',
                  style: 'destructive',
                  onPress: async () => {
                    await clearUserData();
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'Login'}],
                    });
                  },
                },
              ],
            );
          }}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={isChangePasswordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsChangePasswordModalVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setIsChangePasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                activeOpacity={0.7}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contraseña Actual</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ingresa tu contraseña actual"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nueva Contraseña</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <Text style={styles.formHint}>
                  Mínimo 6 caracteres
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirmar Nueva Contraseña</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.changePasswordButton,
                  isChangingPassword && styles.changePasswordButtonDisabled,
                ]}
                onPress={async () => {
                  if (!currentPassword || !newPassword || !confirmPassword) {
                    Alert.alert('Error', 'Por favor completa todos los campos');
                    return;
                  }

                  if (newPassword.length < 6) {
                    Alert.alert(
                      'Error',
                      'La nueva contraseña debe tener al menos 6 caracteres',
                    );
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    Alert.alert(
                      'Error',
                      'Las contraseñas no coinciden',
                    );
                    return;
                  }

                  if (currentPassword === newPassword) {
                    Alert.alert(
                      'Error',
                      'La nueva contraseña debe ser diferente a la actual',
                    );
                    return;
                  }

                  try {
                    setIsChangingPassword(true);
                    const jwt = await getJWT();
                    if (!jwt) {
                      Alert.alert(
                        'Error',
                        'No se encontró la sesión. Por favor inicia sesión nuevamente.',
                      );
                      navigation.navigate('Login');
                      return;
                    }

                    await changePasswordUser(
                      currentPassword,
                      newPassword,
                      jwt,
                    );
                    Alert.alert(
                      'Éxito',
                      'Tu contraseña ha sido actualizada correctamente',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            setIsChangePasswordModalVisible(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          },
                        },
                      ],
                    );
                  } catch (error: any) {
                    console.error('Error al cambiar contraseña:', error);
                    Alert.alert(
                      'Error',
                      error?.message ||
                        'No se pudo cambiar la contraseña. Por favor intenta de nuevo.',
                    );
                  } finally {
                    setIsChangingPassword(false);
                  }
                }}
                disabled={isChangingPassword}
                activeOpacity={0.8}>
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.changePasswordButtonText}>
                    Cambiar Contraseña
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1a1a1a',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#1e88e5',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  userUsername: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e88e5',
    marginBottom: 8,
  },
  balanceFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  balanceRow: {
    marginBottom: 8,
  },
  votingPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  votingPointsLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  votingPointsValue: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '700',
  },
  navigationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  navButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountsIcon: {
    backgroundColor: '#1e88e5',
  },
  profileIcon: {
    backgroundColor: '#10b981',
  },
  shopIcon: {
    backgroundColor: '#f59e0b',
  },
  premiumIcon: {
    backgroundColor: '#fbbf24',
  },
  rouletteIcon: {
    backgroundColor: '#8b5cf6',
  },
  portalIcon: {
    backgroundColor: '#06b6d4',
  },
  transactionsIcon: {
    backgroundColor: '#8b5cf6',
  },
  navIconText: {
    fontSize: 24,
  },
  navButtonTextContainer: {
    flex: 1,
  },
  navButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  navButtonSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  navArrow: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordIcon: {
    backgroundColor: '#8b5cf6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: '300',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  formHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  changePasswordButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  changePasswordButtonDisabled: {
    opacity: 0.6,
  },
  changePasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;

