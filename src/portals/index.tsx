import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Character} from '../api/models/CharacterModel';
import {Account} from '../api/models/AccountModel';
import {getTeleports, teleport, Teleport as TeleportType} from '../api/internal';
import {getJWT} from '../services/storage';

const PortalsScreen = ({navigation, route}: any) => {
  const {character, account} = route.params;
  const [teleports, setTeleports] = useState<TeleportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teleporting, setTeleporting] = useState<number | null>(null);

  useEffect(() => {
    loadTeleports();
  }, []);

  const loadTeleports = async () => {
    try {
      setIsLoading(true);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      // Usar race_id del personaje y server_id de la cuenta
      const result = await getTeleports(character.race_id, account.server_id, jwt);
      setTeleports(result);
    } catch (error: any) {
      console.error('Error al cargar teleports:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los teleports. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeleport = async (portal: TeleportType) => {
    try {
      setTeleporting(portal.id);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      await teleport(
        jwt,
        account.account_id,
        character.id,
        account.server_id,
        portal.id,
      );

      Alert.alert(
        '¡Teletransporte Exitoso!',
        `${character.name} ha sido teletransportado a ${portal.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error al teletransportar:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo realizar el teletransporte. Por favor intenta de nuevo.',
      );
    } finally {
      setTeleporting(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Teleport</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Character Info */}
        <View style={styles.characterInfoCard}>
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
                {character.race} {character.gender} • {character.class} • Nivel {character.level}
              </Text>
            </View>
          </View>
        </View>

        {/* Portals List */}
        <View style={styles.portalsContainer}>
          <Text style={styles.sectionTitle}>Portales Disponibles</Text>
          <Text style={styles.sectionDescription}>
            Selecciona un destino para teletransportar a {character.name}
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e88e5" />
              <Text style={styles.loadingText}>Cargando portales...</Text>
            </View>
          ) : teleports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌀</Text>
              <Text style={styles.emptyTitle}>No hay portales disponibles</Text>
              <Text style={styles.emptyText}>
                No hay portales disponibles para tu raza en este reino.
              </Text>
            </View>
          ) : (
            teleports.map(portal => (
              <TouchableOpacity
                key={portal.id}
                style={[
                  styles.portalCard,
                  teleporting === portal.id && styles.portalCardLoading,
                ]}
                activeOpacity={0.8}
                onPress={() => handleTeleport(portal)}
                disabled={teleporting !== null}>
                {portal.img_url ? (
                  <Image
                    source={{uri: portal.img_url}}
                    style={styles.portalImage}
                    defaultSource={{
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                    }}
                  />
                ) : (
                  <Text style={styles.portalIcon}>🌀</Text>
                )}
                <View style={styles.portalInfo}>
                  <Text style={styles.portalName}>{portal.name}</Text>
                  {portal.faction && (
                    <Text style={styles.portalFaction}>
                      {portal.faction === 'Horde' ? '⚔️ Horda' : '🛡️ Alianza'}
                    </Text>
                  )}
                  {portal.zone && (
                    <Text style={styles.portalDescription}>
                      Zona: {portal.zone}
                    </Text>
                  )}
                </View>
                {teleporting === portal.id ? (
                  <ActivityIndicator size="small" color="#1e88e5" />
                ) : (
                  <Text style={styles.portalArrow}>→</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  characterInfoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterImages: {
    flexDirection: 'row',
    marginRight: 12,
  },
  characterLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    marginRight: 4,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 14,
    color: '#9ca3af',
  },
  portalsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  portalIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  portalInfo: {
    flex: 1,
  },
  portalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  portalDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  portalArrow: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  portalCardLoading: {
    opacity: 0.6,
  },
  portalImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#2a2a2a',
  },
  portalFaction: {
    fontSize: 12,
    color: '#1e88e5',
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default PortalsScreen;

