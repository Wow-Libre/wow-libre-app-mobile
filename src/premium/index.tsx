import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Character} from '../api/models/CharacterModel';
import {Account} from '../api/models/AccountModel';
import {
  getBenefitsPremium,
  claimBenefitsPremium,
  getSubscriptionActive,
  SubscriptionsBenefit,
} from '../api/internal/index';
import {getJWT} from '../services/storage';

const PremiumScreen = ({navigation, route}: any) => {
  const {character, account} = route.params;
  const [benefits, setBenefits] = useState<SubscriptionsBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [claimingBenefit, setClaimingBenefit] = useState<number | null>(null);

  useEffect(() => {
    loadBenefits();
    checkSubscription();
  }, []);

  const loadBenefits = async () => {
    try {
      setIsLoading(true);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getBenefitsPremium('es', jwt, account.server_id);
      setBenefits(result.benefits || []);
    } catch (error: any) {
      console.error('Error al cargar beneficios:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los beneficios. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const jwt = await getJWT();
      if (!jwt) return;

      const active = await getSubscriptionActive(jwt);
      setIsSubscribed(active);
    } catch (error: any) {
      console.error('Error al verificar suscripción:', error);
      setIsSubscribed(false);
    }
  };

  const handleClaimBenefit = async (benefit: SubscriptionsBenefit) => {
    try {
      setClaimingBenefit(benefit.id);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      await claimBenefitsPremium(
        account.server_id,
        account.account_id,
        character.id,
        benefit.id,
        'es',
        jwt,
      );

      Alert.alert('¡Éxito!', `Has reclamado: ${benefit.name}`);
    } catch (error: any) {
      console.error('Error al reclamar beneficio:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo reclamar el beneficio. Por favor intenta de nuevo.',
      );
    } finally {
      setClaimingBenefit(null);
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
        <Text style={styles.title}>Premium</Text>
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

        {/* Premium Content */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>👑 Beneficios Premium</Text>
          <Text style={styles.contentDescription}>
            {isSubscribed
              ? `Beneficios disponibles para ${character.name}`
              : `Desbloquea beneficios exclusivos para ${character.name}`}
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text style={styles.loadingText}>Cargando beneficios...</Text>
            </View>
          ) : benefits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay beneficios disponibles</Text>
            </View>
          ) : (
            <View style={styles.benefitsList}>
              {benefits.map((benefit) => (
                <View key={benefit.id} style={styles.benefitCard}>
                  <View style={styles.benefitHeader}>
                    {benefit.img ? (
                      <Image
                        source={{uri: benefit.img}}
                        style={styles.benefitImage}
                        defaultSource={{
                          uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                        }}
                      />
                    ) : (
                      <View style={styles.benefitImagePlaceholder}>
                        <Text style={styles.benefitIcon}>🎁</Text>
                      </View>
                    )}
                    <View style={styles.benefitInfo}>
                      <Text style={styles.benefitName}>{benefit.name}</Text>
                      <Text style={styles.benefitDescription}>
                        {benefit.description}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.claimButton,
                      claimingBenefit === benefit.id && styles.claimButtonDisabled,
                    ]}
                    onPress={() => handleClaimBenefit(benefit)}
                    disabled={claimingBenefit === benefit.id}
                    activeOpacity={0.8}>
                    {claimingBenefit === benefit.id ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <Text style={styles.claimButtonText}>
                        {benefit.btn_txt || 'Reclamar'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {!isSubscribed && (
            <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.8}>
              <Text style={styles.subscribeButtonText}>Suscribirse a Premium</Text>
            </TouchableOpacity>
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
  contentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  benefitCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  benefitHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
  },
  benefitImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitInfo: {
    flex: 1,
  },
  benefitName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  claimButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PremiumScreen;

