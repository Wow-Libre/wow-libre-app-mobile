import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {getAccounts, getCharacters} from '../api/internal';
import {Account} from '../api/models/AccountModel';
import {Character} from '../api/models/CharacterModel';
import {getJWT} from '../services/storage';

const AccountsScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const loadAccounts = async () => {
    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getAccounts(jwt, 0, 10, null, null);
      setAccounts(result.accounts);
    } catch (error: any) {
      console.error('Error al cargar cuentas:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar las cuentas. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadAccounts();
  };

  const loadCharacters = async (account: Account) => {
    setIsLoadingCharacters(true);
    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getCharacters(jwt, account.account_id, account.server_id);
      setCharacters(result.characters);
      setSelectedAccount(account);
      setIsModalVisible(true);
    } catch (error: any) {
      console.error('Error al cargar personajes:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los personajes. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedAccount(null);
    setCharacters([]);
    setSelectedCharacter(null);
  };

  const formatMoney = (money: number) => {
    // El dinero viene en cobre, convertir primero dividiendo por 1000
    // Luego aplicar sistema WoW: 1 oro = 100 plata = 10,000 cobre
    // 1 plata = 100 cobre
    const totalCopper = Math.floor(money / 1000); // Convertir de la unidad del API a cobre
    const gold = Math.floor(totalCopper / 10000);
    const silver = Math.floor((totalCopper % 10000) / 100);
    const copper = totalCopper % 100;
    return `${gold}g ${silver}s ${copper}c`;
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#10b981' : '#ef4444';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Activa' : 'Inactiva';
  };

  const renderAccountCard = (account: Account) => {
    return (
      <TouchableOpacity
        key={account.id}
        style={styles.accountCard}
        activeOpacity={0.8}
        onPress={() => loadCharacters(account)}>
        <View style={styles.cardHeader}>
          <Image
            source={{uri: account.avatar}}
            style={styles.avatar}
            defaultSource={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
            }}
          />
          <View style={styles.accountInfo}>
            <Text style={styles.username}>{account.username}</Text>
            <Text style={styles.email}>{account.email}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(account.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(account.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reino:</Text>
            <Text style={styles.infoValue}>{account.realm}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expansión:</Text>
            <Text style={styles.infoValue}>{account.expansion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account ID:</Text>
            <Text style={styles.infoValue}>#{account.account_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sitio Web:</Text>
            <Text style={styles.infoValue}>{account.web_site}</Text>
          </View>
        </View>

        {account.realmlist && (
          <View style={styles.realmlistContainer}>
            <Text style={styles.realmlistLabel}>Realmlist:</Text>
            <Text style={styles.realmlistText}>{account.realmlist}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Cargando cuentas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Cuentas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={styles.emptyTitle}>No tienes cuentas</Text>
            <Text style={styles.emptyText}>
              Aún no has creado ninguna cuenta de juego.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'} encontrada
              {accounts.length !== 1 ? 's' : ''}
            </Text>
            {accounts.map(account => renderAccountCard(account))}
          </>
        )}
      </ScrollView>

      {/* Modal de Personajes */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle}>Personajes</Text>
                {selectedAccount && (
                  <>
                    <Text style={styles.modalSubtitle}>{selectedAccount.username}</Text>
                    <Text style={styles.modalRealm}>Reino: {selectedAccount.realm}</Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoadingCharacters ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#1e88e5" />
                <Text style={styles.modalLoadingText}>Cargando personajes...</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}>
                {characters.length === 0 ? (
                  <View style={styles.modalEmptyContainer}>
                    <Text style={styles.modalEmptyIcon}>⚔️</Text>
                    <Text style={styles.modalEmptyTitle}>No hay personajes</Text>
                    <Text style={styles.modalEmptyText}>
                      Esta cuenta no tiene personajes creados aún.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.modalCountText}>
                      {characters.length} {characters.length === 1 ? 'personaje' : 'personajes'} encontrado
                      {characters.length !== 1 ? 's' : ''}
                    </Text>
                    {characters.map(character => (
                      <TouchableOpacity
                        key={character.id}
                        style={[
                          styles.characterCard,
                          selectedCharacter?.id === character.id && styles.characterCardSelected,
                        ]}
                        activeOpacity={0.7}
                        delayPressIn={0}
                        onPress={() => {
                          console.log('Personaje seleccionado:', character.name);
                          setSelectedCharacter(character);
                        }}>
                        <View style={styles.characterHeader}>
                          <View style={styles.characterImages}>
                            <Image
                              source={{uri: character.race_logo}}
                              style={styles.characterLogo}
                              defaultSource={{
                                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                              }}
                            />
                            <Image
                              source={{uri: character.class_logo}}
                              style={styles.characterLogo}
                              defaultSource={{
                                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                              }}
                            />
                          </View>
                          <View style={styles.characterInfo}>
                            <Text style={styles.characterName}>{character.name}</Text>
                            <Text style={styles.characterDetails}>
                              {character.race} {character.gender} • {character.class}
                            </Text>
                          </View>
                          {selectedCharacter?.id === character.id && (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>✓</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.characterStats}>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Nivel</Text>
                            <Text style={styles.statValue}>{character.level}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>XP</Text>
                            <Text style={styles.statValue}>{character.xp.toLocaleString()}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Dinero</Text>
                            <Text style={styles.statValue}>{formatMoney(character.money)}</Text>
                          </View>
                        </View>

                        {character.note && (
                          <View style={styles.noteContainer}>
                            <Text style={styles.noteLabel}>Nota:</Text>
                            <Text style={styles.noteText}>{character.note}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}

                    {selectedCharacter && (
                      <View style={styles.characterActionsContainer}>
                        <Text style={styles.actionsTitle}>
                          Acciones para {selectedCharacter.name}
                        </Text>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.premiumButton]}
                          activeOpacity={0.8}
                          onPress={() => {
                            closeModal();
                            navigation.navigate('Premium', {
                              character: selectedCharacter,
                              account: selectedAccount,
                            });
                          }}>
                          <Text style={styles.actionButtonIcon}>👑</Text>
                          <View style={styles.actionButtonTextContainer}>
                            <Text style={styles.actionButtonTitle}>Premium</Text>
                            <Text style={styles.actionButtonSubtitle}>
                              Beneficios exclusivos
                            </Text>
                          </View>
                          <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.portalButton]}
                          activeOpacity={0.8}
                          onPress={() => {
                            closeModal();
                            navigation.navigate('Portals', {
                              character: selectedCharacter,
                              account: selectedAccount,
                            });
                          }}>
                          <Text style={styles.actionButtonIcon}>🌀</Text>
                          <View style={styles.actionButtonTextContainer}>
                            <Text style={styles.actionButtonTitle}>Teleport</Text>
                            <Text style={styles.actionButtonSubtitle}>
                              Portales y teletransporte
                            </Text>
                          </View>
                          <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.profileButton]}
                          activeOpacity={0.8}
                          onPress={() => {
                            closeModal();
                            navigation.navigate('Profile', {
                              character: selectedCharacter,
                              account: selectedAccount,
                            });
                          }}>
                          <Text style={styles.actionButtonIcon}>⚙️</Text>
                          <View style={styles.actionButtonTextContainer}>
                            <Text style={styles.actionButtonTitle}>Administración</Text>
                            <Text style={styles.actionButtonSubtitle}>
                              Gestiona tu personaje
                            </Text>
                          </View>
                          <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.rouletteButton]}
                          activeOpacity={0.8}
                          onPress={() => {
                            closeModal();
                            navigation.navigate('FruitWheel', {
                              character: selectedCharacter,
                              account: selectedAccount,
                            });
                          }}>
                          <Text style={styles.actionButtonIcon}>🎰</Text>
                          <View style={styles.actionButtonTextContainer}>
                            <Text style={styles.actionButtonTitle}>Ruleta</Text>
                            <Text style={styles.actionButtonSubtitle}>
                              Prueba tu suerte
                            </Text>
                          </View>
                          <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    fontWeight: '500',
  },
  accountCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  realmlistContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  realmlistLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  realmlistText: {
    fontSize: 13,
    color: '#1e88e5',
    fontFamily: 'monospace',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 2,
  },
  modalRealm: {
    fontSize: 13,
    color: '#6b7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalLoadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  modalScrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  modalCountText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  modalEmptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Character Card Styles
  characterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterCardSelected: {
    borderColor: '#1e88e5',
    borderWidth: 2,
    backgroundColor: '#1a1f2e',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  characterImages: {
    flexDirection: 'row',
    marginRight: 12,
  },
  characterLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 4,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 13,
    color: '#9ca3af',
  },
  selectedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e88e5',
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  noteLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 13,
    color: '#ffffff',
  },
  selectButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  characterActionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  premiumButton: {
    borderColor: '#fbbf24',
  },
  portalButton: {
    borderColor: '#06b6d4',
  },
  profileButton: {
    borderColor: '#10b981',
  },
  rouletteButton: {
    borderColor: '#8b5cf6',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionButtonTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  actionArrow: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default AccountsScreen;

