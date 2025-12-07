import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {getPoints, claimMachine, MachineDto} from '../api/internal';
import {getJWT} from '../services/storage';

const {width, height} = Dimensions.get('window');
const REEL_WIDTH = (width - 60) / 3;
const REEL_HEIGHT = 200;
const ITEM_HEIGHT = 100;

interface WoWItem {
  name: string;
  emoji: string;
  color: string;
}

const wowItems: WoWItem[] = [
  {name: 'Guerrero', emoji: '⚔️', color: '#c41e3a'},
  {name: 'Mago', emoji: '🔮', color: '#69ccf0'},
  {name: 'Paladín', emoji: '🛡️', color: '#f58cba'},
  {name: 'Espada Épica', emoji: '🗡️', color: '#a335ee'},
  {name: 'Dragón', emoji: '🐉', color: '#ff8000'},
  {name: 'Oro', emoji: '🪙', color: '#ffd700'},
  {name: 'Poción', emoji: '🧪', color: '#1eff00'},
  {name: 'Gema', emoji: '💎', color: '#0070dd'},
];

const FruitWheelScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route?: any;
}): React.JSX.Element => {
  const character = route?.params?.character;
  const account = route?.params?.account;
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [results, setResults] = useState<WoWItem[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [availableCoins, setAvailableCoins] = useState<number | null>(null);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [machineResult, setMachineResult] = useState<MachineDto | null>(null);
  
  const reel1Anim = useRef(new Animated.Value(0)).current;
  const reel2Anim = useRef(new Animated.Value(0)).current;
  const reel3Anim = useRef(new Animated.Value(0)).current;

  // Cargar puntos disponibles al montar el componente
  useEffect(() => {
    loadAvailableCoins();
  }, []);

  const loadAvailableCoins = async () => {
    if (!character || !account) {
      setIsLoadingCoins(false);
      return;
    }

    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getPoints(jwt, account.account_id, account.server_id);
      setAvailableCoins(result.coins);
    } catch (error: any) {
      console.error('Error al cargar puntos:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los puntos disponibles.',
      );
    } finally {
      setIsLoadingCoins(false);
    }
  };

  // Crear lista extendida de items para el efecto de scroll infinito
  const extendedItems = [...wowItems, ...wowItems, ...wowItems, ...wowItems];
  const totalHeight = extendedItems.length * ITEM_HEIGHT;
  const singleReelHeight = wowItems.length * ITEM_HEIGHT;

  const spinReels = async () => {
    if (isSpinning) return;
    
    if (!character || !account) {
      Alert.alert('Error', 'No se encontró información del personaje o cuenta.');
      return;
    }

    if (availableCoins !== null && availableCoins <= 0) {
      Alert.alert('Sin puntos', 'No tienes puntos disponibles para girar la ruleta.');
      return;
    }

    setIsSpinning(true);
    setResults([]);
    setHasWon(false);
    setMachineResult(null);

    // Primero llamar a la API para obtener el resultado
    let machineResult: MachineDto | null = null;
    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        setIsSpinning(false);
        return;
      }

      machineResult = await claimMachine(
        account.server_id,
        account.account_id,
        character.id,
        jwt,
        'es',
      );
      
      // Debug: ver qué está devolviendo la API
      console.log('Machine Result:', JSON.stringify(machineResult, null, 2));
      console.log('ItemId:', machineResult.itemId);
      console.log('ItemEntry:', machineResult.itemEntry);
      console.log('All keys:', Object.keys(machineResult));
      
      setMachineResult(machineResult);
    } catch (error: any) {
      console.error('Error al reclamar premio:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo procesar el resultado de la ruleta.',
      );
      setIsSpinning(false);
      return;
    }

    // Si ganó, usar el mismo icono para los 3 rodillos
    // Si no ganó, usar iconos aleatorios
    let result1: WoWItem;
    let result2: WoWItem;
    let result3: WoWItem;

    if (machineResult.winner) {
      // Si ganó, todos los rodillos muestran el mismo icono
      // Intentar encontrar un item que coincida con el logo o usar el primero
      const winnerItem = wowItems.find(
        item => item.emoji === machineResult.logo || item.name.toLowerCase().includes(machineResult.type?.toLowerCase() || '')
      ) || wowItems[0]; // Si no encuentra coincidencia, usar el primer item
      
      result1 = winnerItem;
      result2 = winnerItem;
      result3 = winnerItem;
    } else {
      // Si no ganó, usar iconos aleatorios
      result1 = wowItems[Math.floor(Math.random() * wowItems.length)];
      result2 = wowItems[Math.floor(Math.random() * wowItems.length)];
      result3 = wowItems[Math.floor(Math.random() * wowItems.length)];
    }

    // Calcular índices de los items seleccionados
    const index1 = wowItems.indexOf(result1);
    const index2 = wowItems.indexOf(result2);
    const index3 = wowItems.indexOf(result3);

    // Calcular desplazamientos (múltiplos de la altura del item + offset)
    const baseSpins = 5; // Mínimo de vueltas
    let spins1, spins2, spins3;
    
    if (machineResult.winner) {
      // Si ganó, todos los rodillos deben terminar al mismo tiempo con el mismo icono
      const baseSpin = baseSpins + Math.random() * 2;
      spins1 = baseSpin;
      spins2 = baseSpin;
      spins3 = baseSpin;
    } else {
      // Si no ganó, usar giros aleatorios diferentes
      const extraSpins1 = Math.random() * 3;
      const extraSpins2 = Math.random() * 3;
      const extraSpins3 = Math.random() * 3;
      spins1 = baseSpins + extraSpins1;
      spins2 = baseSpins + extraSpins2;
      spins3 = baseSpins + extraSpins3;
    }

    // El indicador está en el centro del rodillo
    // Necesitamos que el item seleccionado quede centrado ahí
    const indicatorCenter = (REEL_HEIGHT - ITEM_HEIGHT) / 2;
    
    // Calcular posición final de manera que el item quede exactamente centrado
    // Enfoque: calcular directamente la posición que hace que el item correcto quede en el centro
    const calculateFinalPosition = (spins: number, itemIndex: number) => {
      // Distancia total de las vueltas
      const spinDistance = spins * singleReelHeight;
      
      const itemPosition = itemIndex * ITEM_HEIGHT;
      
      const totalDistance = spinDistance + itemPosition;
      
      let finalPosition = -totalDistance + indicatorCenter;
      
      const cycles = Math.floor(-finalPosition / totalHeight);
      finalPosition = finalPosition + (cycles * totalHeight);
      
      // Asegurar que esté en el rango correcto
      if (finalPosition > 0) {
        finalPosition -= totalHeight;
      }
      if (finalPosition < -totalHeight) {
        finalPosition += totalHeight;
      }
      
      return finalPosition;
    };

    const targetY1 = calculateFinalPosition(spins1, index1);
    const targetY2 = calculateFinalPosition(spins2, index2);
    const targetY3 = calculateFinalPosition(spins3, index3);

    // Animar rodillos con diferentes duraciones para efecto cascada
    // Si ganó, todos terminan al mismo tiempo
    const baseDuration = 2000;
    const duration1 = machineResult.winner 
      ? baseDuration 
      : baseDuration + Math.random() * 500;
    const duration2 = machineResult.winner 
      ? baseDuration 
      : baseDuration + 200 + Math.random() * 500;
    const duration3 = machineResult.winner 
      ? baseDuration 
      : baseDuration + 400 + Math.random() * 500;

    Animated.parallel([
      Animated.timing(reel1Anim, {
        toValue: targetY1,
        duration: duration1,
        useNativeDriver: true,
      }),
      Animated.timing(reel2Anim, {
        toValue: targetY2,
        duration: duration2,
        useNativeDriver: true,
      }),
      Animated.timing(reel3Anim, {
        toValue: targetY3,
        duration: duration3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Verificar y corregir las posiciones finales para asegurar que los items correctos estén centrados
      const verifyAndCorrectPosition = (currentPos: number, targetIndex: number) => {
        // Calcular la posición Y absoluta del centro del indicador
        // currentPos es negativo (translateY hacia arriba)
        const centerAbsoluteY = -currentPos + indicatorCenter;
        
        // Calcular qué índice de item está en el centro
        // El centro está en centerAbsoluteY desde el inicio del contenido
        // Necesitamos saber qué item está en esa posición
        const itemNumber = Math.floor(centerAbsoluteY / ITEM_HEIGHT);
        const currentCenterIndex = itemNumber % wowItems.length;
        const normalizedIndex = currentCenterIndex < 0 
          ? (currentCenterIndex + wowItems.length) % wowItems.length
          : currentCenterIndex;
        
        // Si el item en el centro no es el correcto, ajustar
        if (normalizedIndex !== targetIndex) {
          // Calcular cuántos items necesitamos mover
          let diff = targetIndex - normalizedIndex;
          if (diff < 0) diff += wowItems.length;
          if (diff === 0) diff = wowItems.length; // Si son iguales pero no coinciden, mover una vuelta
          
          // Ajustar la posición moviendo exactamente 'diff' items
          let adjustedPos = currentPos - (diff * ITEM_HEIGHT);
          
          // Normalizar de nuevo al rango válido
          while (adjustedPos < -totalHeight) {
            adjustedPos += totalHeight;
          }
          while (adjustedPos > 0) {
            adjustedPos -= totalHeight;
          }
          
          return adjustedPos;
        }
        
        return currentPos;
      };
      
      const finalY1Corrected = verifyAndCorrectPosition(targetY1, index1);
      const finalY2Corrected = verifyAndCorrectPosition(targetY2, index2);
      const finalY3Corrected = verifyAndCorrectPosition(targetY3, index3);
      
      // Asegurar que los valores finales estén correctamente posicionados
      reel1Anim.setValue(finalY1Corrected);
      reel2Anim.setValue(finalY2Corrected);
      reel3Anim.setValue(finalY3Corrected);

      setResults([result1, result2, result3]);
      setHasWon(machineResult.winner);
      
      // Mostrar mensaje del resultado
      if (machineResult.winner) {
        Alert.alert('¡Ganaste! 🎉', machineResult.message);
      } else {
        Alert.alert('Resultado', machineResult.message);
      }

      // Recargar puntos disponibles
      loadAvailableCoins().finally(() => {
        setIsSpinning(false);
      });
    });
  };

  const renderReel = (reelAnim: Animated.Value, index: number) => {
    return (
      <View style={styles.reelContainer}>
        <View style={styles.reelMask}>
          <Animated.View
            style={[
              styles.reelContent,
              {
                transform: [{translateY: reelAnim}],
              },
            ]}>
            {extendedItems.map((item, i) => (
              <View
                key={`${index}-${i}`}
                style={[
                  styles.reelItem,
                  {backgroundColor: item.color},
                ]}>
                <Text style={styles.reelEmoji}>{item.emoji}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
        {/* Indicador central */}
        <View style={styles.reelIndicator} />
      </View>
    );
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
        <Text style={styles.headerTitle}>Máquina de Azeroth</Text>
        <Text style={styles.headerSubtitle}>¡Gira los rodillos y gana tesoros!</Text>
        {character && (
          <Text style={styles.characterInfo}>
            {character.name} - {account?.realm || 'Reino desconocido'}
          </Text>
        )}
        {isLoadingCoins ? (
          <ActivityIndicator size="small" color="#1e88e5" style={{marginTop: 8}} />
        ) : (
          <Text style={styles.coinsText}>
            Puntos disponibles: {availableCoins !== null ? availableCoins : 'N/A'}
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Rodillos */}
        <View style={styles.reelsContainer}>
          {renderReel(reel1Anim, 0)}
          {renderReel(reel2Anim, 1)}
          {renderReel(reel3Anim, 2)}
        </View>

        {/* Resultado */}
        {results.length > 0 && machineResult && (
          <View style={styles.resultContainer}>
            {machineResult.winner ? (
              <>
                <Text style={styles.winTitle}>🎉 ¡GANADOR! 🎉</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    {results.map((item, index) => (
                      <View key={index} style={styles.resultFruit}>
                        <Text style={styles.resultEmoji}>{item.emoji}</Text>
                        <Text style={styles.resultName}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                  {machineResult.logo && (
                    <View style={styles.prizeImageContainer}>
                      <Image
                        source={{uri: machineResult.logo}}
                        style={styles.prizeImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  <Text style={styles.resultMessage}>{machineResult.message}</Text>
                  {machineResult.name && (
                    <Text style={styles.resultType}>
                      Premio: {machineResult.name}
                    </Text>
                  )}
                  {machineResult.type && (
                    <Text style={styles.resultTypeSmall}>
                      Tipo: {machineResult.type}
                    </Text>
                  )}
                  <View style={styles.inboxMessageContainer}>
                    <Text style={styles.inboxMessageIcon}>📬</Text>
                    <Text style={styles.inboxMessageTitle}>¡Premio Obtenido!</Text>
                    <Text style={styles.inboxMessageText}>
                      Has ganado un premio. Por favor, revisa el buzón del juego para reclamarlo.
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>Resultado</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    {results.map((item, index) => (
                      <View key={index} style={styles.resultFruit}>
                        <Text style={styles.resultEmoji}>{item.emoji}</Text>
                        <Text style={styles.resultName}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.resultMessage}>{machineResult.message}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Botón de giro */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.spinButton,
              (isSpinning || (availableCoins !== null && availableCoins <= 0)) &&
                styles.spinButtonDisabled,
            ]}
            onPress={spinReels}
            disabled={isSpinning || (availableCoins !== null && availableCoins <= 0)}
            activeOpacity={0.8}>
            <Text style={styles.spinButtonText}>
              {isSpinning
                ? 'Girando...'
                : availableCoins !== null && availableCoins <= 0
                ? 'Sin puntos disponibles'
                : '🎰 Girar Rodillos'}
            </Text>
          </TouchableOpacity>

          <View style={styles.incentiveSection}>
         
            <View style={styles.motivationalCard}>
              <Text style={styles.motivationalIcon}>🎯</Text>
              <Text style={styles.motivationalTitle}>¡Tu suerte puede cambiar ahora!</Text>
              <Text style={styles.motivationalText}>
                Cada giro es una nueva oportunidad de ganar premios increíbles. 
                ¡No te rindas, la victoria está a un giro de distancia!
              </Text>
            </View>

          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '400',
    marginTop: 4,
  },
  characterInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  coinsText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: '700',
    marginTop: 8,
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 10,
  },
  reelContainer: {
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reelMask: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  reelContent: {
    width: '100%',
  },
  reelItem: {
    width: '100%',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0a0a0a',
  },
  reelEmoji: {
    fontSize: 60,
  },
  reelIndicator: {
    position: 'absolute',
    top: (REEL_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    zIndex: 1,
  },
  resultContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  winTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffd700',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: width - 40,
    borderWidth: 2,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultFruit: {
    alignItems: 'center',
    flex: 1,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultMultiplier: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: '700',
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  prizeImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
  },
  prizeImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  resultType: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  resultTypeSmall: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  inboxMessageContainer: {
    marginTop: 16,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inboxMessageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  inboxMessageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
    textAlign: 'center',
  },
  inboxMessageText: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultMultiplierSmall: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  resultTotal: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  spinButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  spinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fruitsList: {
    marginTop: 4,
  },
  fruitsListTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  fruitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fruitItem: {
    width: (width - 60) / 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  fruitEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  fruitName: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  fruitMultiplier: {
    fontSize: 9,
    color: '#ffd700',
    fontWeight: '600',
  },
  bonusInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  bonusText: {
    fontSize: 13,
    color: '#ffd700',
    fontWeight: '600',
    textAlign: 'center',
  },
  incentiveSection: {
    marginTop: 4,
  },
  premiumPrizesCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumPrizesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumPrizesIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  premiumPrizesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
    flex: 1,
  },
  premiumPrizesList: {
    gap: 12,
  },
  premiumPrizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  premiumPrizeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumPrizeInfo: {
    flex: 1,
  },
  premiumPrizeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  premiumPrizeDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  premiumPrizeBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  motivationalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1e88e5',
    alignItems: 'center',
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  motivationalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e88e5',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationalText: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
  },
  jackpotCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  jackpotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jackpotIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  jackpotInfo: {
    flex: 1,
  },
  jackpotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  jackpotSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  jackpotMultiplier: {
    alignItems: 'center',
    marginLeft: 16,
  },
  jackpotMultiplierText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10b981',
    lineHeight: 40,
  },
  jackpotMultiplierLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
});

export default FruitWheelScreen;
