import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {getCharacters} from '../api/internal';
import {Character} from '../api/models/CharacterModel';
import {getJWT} from '../services/storage';

const CharactersScreen = ({navigation, route}: any) => {
  const {accountId, serverId, accountName, realm} = route.params;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  const loadCharacters = async () => {
    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getCharacters(jwt, accountId, serverId);
      setCharacters(result.characters);
    } catch (error: any) {
      console.error('Error al cargar personajes:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los personajes. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCharacters();
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

  const renderCharacterCard = (character: Character) => {
    const isSelected = selectedCharacter?.id === character.id;

    return (
      <TouchableOpacity
        key={character.id}
        style={[styles.characterCard, isSelected && styles.characterCardSelected]}
        activeOpacity={0.8}
        onPress={() => setSelectedCharacter(character)}>
        <View style={styles.characterHeader}>
          <View style={styles.characterImages}>
            <Image
              source={{uri: character.race_logo}}
              style={styles.logo}
              defaultSource={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
              }}
            />
            <Image
              source={{uri: character.class_logo}}
              style={styles.logo}
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
          {isSelected && (
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
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Cargando personajes...</Text>
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
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Personajes</Text>
          {accountName && (
            <Text style={styles.subtitle}>{accountName}</Text>
          )}
          {realm && (
            <Text style={styles.realmText}>Reino: {realm}</Text>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {characters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚔️</Text>
            <Text style={styles.emptyTitle}>No hay personajes</Text>
            <Text style={styles.emptyText}>
              Esta cuenta no tiene personajes creados aún.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>
              {characters.length} {characters.length === 1 ? 'personaje' : 'personajes'} encontrado
              {characters.length !== 1 ? 's' : ''}
            </Text>
            {characters.map(character => renderCharacterCard(character))}
            
            {selectedCharacter && (
              <TouchableOpacity
                style={styles.selectButton}
                activeOpacity={0.8}
                onPress={() => {
                  // Aquí puedes agregar la lógica para usar el personaje seleccionado
                  Alert.alert(
                    'Personaje Seleccionado',
                    `Has seleccionado a ${selectedCharacter.name}`,
                    [{text: 'OK'}],
                  );
                }}>
                <Text style={styles.selectButtonText}>
                  Usar {selectedCharacter.name}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  realmText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
  countText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    fontWeight: '500',
  },
  characterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  logo: {
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
});

export default CharactersScreen;

