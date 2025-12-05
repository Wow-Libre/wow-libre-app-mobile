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
} from 'react-native';

const {width, height} = Dimensions.get('window');
const REEL_WIDTH = (width - 60) / 3;
const REEL_HEIGHT = 200;
const ITEM_HEIGHT = 100;

interface WoWItem {
  name: string;
  emoji: string;
  color: string;
  multiplier: number;
}

const wowItems: WoWItem[] = [
  {name: 'Guerrero', emoji: '⚔️', color: '#c41e3a', multiplier: 2},
  {name: 'Mago', emoji: '🔮', color: '#69ccf0', multiplier: 3},
  {name: 'Paladín', emoji: '🛡️', color: '#f58cba', multiplier: 2},
  {name: 'Espada Épica', emoji: '🗡️', color: '#a335ee', multiplier: 4},
  {name: 'Dragón', emoji: '🐉', color: '#ff8000', multiplier: 5},
  {name: 'Oro', emoji: '🪙', color: '#ffd700', multiplier: 3},
  {name: 'Poción', emoji: '🧪', color: '#1eff00', multiplier: 2},
  {name: 'Gema', emoji: '💎', color: '#0070dd', multiplier: 4},
];

const FruitWheelScreen = (): React.JSX.Element => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [results, setResults] = useState<WoWItem[]>([]);
  const [hasWon, setHasWon] = useState(false);
  
  const reel1Anim = useRef(new Animated.Value(0)).current;
  const reel2Anim = useRef(new Animated.Value(0)).current;
  const reel3Anim = useRef(new Animated.Value(0)).current;

  // Crear lista extendida de items para el efecto de scroll infinito
  const extendedItems = [...wowItems, ...wowItems, ...wowItems, ...wowItems];
  const totalHeight = extendedItems.length * ITEM_HEIGHT;
  const singleReelHeight = wowItems.length * ITEM_HEIGHT;

  const spinReels = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResults([]);
    setHasWon(false);

    // Seleccionar items aleatorios para cada rodillo
    const result1 = wowItems[Math.floor(Math.random() * wowItems.length)];
    const result2 = wowItems[Math.floor(Math.random() * wowItems.length)];
    const result3 = wowItems[Math.floor(Math.random() * wowItems.length)];

    // Calcular índices de los items seleccionados
    const index1 = wowItems.indexOf(result1);
    const index2 = wowItems.indexOf(result2);
    const index3 = wowItems.indexOf(result3);

    // Calcular desplazamientos (múltiplos de la altura del item + offset)
    const baseSpins = 5; // Mínimo de vueltas
    const extraSpins1 = Math.random() * 3;
    const extraSpins2 = Math.random() * 3;
    const extraSpins3 = Math.random() * 3;

    const spins1 = baseSpins + extraSpins1;
    const spins2 = baseSpins + extraSpins2;
    const spins3 = baseSpins + extraSpins3;

    // El indicador está en el centro del rodillo
    // Necesitamos que la fruta ganadora quede centrada ahí
    const indicatorCenter = (REEL_HEIGHT - ITEM_HEIGHT) / 2;
    
    // Calcular posición final: 
    // - Empezamos desde 0 (primer item en la parte superior)
    // - Giramos N vueltas completas (cada vuelta = singleReelHeight)
    // - Luego nos movemos al índice del item ganador
    // - Finalmente ajustamos para centrar en el indicador
    const calculateFinalPosition = (spins: number, itemIndex: number) => {
      // Posición del item en el primer set
      const itemPosition = itemIndex * ITEM_HEIGHT;
      // Giramos N vueltas completas
      const spinDistance = spins * singleReelHeight;
      // Posición total desde el inicio
      const totalDistance = spinDistance + itemPosition;
      // Ajustar para centrar en el indicador
      return -totalDistance + indicatorCenter;
    };

    const finalY1 = calculateFinalPosition(spins1, index1);
    const finalY2 = calculateFinalPosition(spins2, index2);
    const finalY3 = calculateFinalPosition(spins3, index3);

    // Normalizar valores para mantenerlos en rango visible
    // El contenido se repite, así que podemos usar módulo
    const normalizeValue = (value: number) => {
      // Normalizar al rango de -totalHeight a 0
      let normalized = value;
      // Usar módulo para mantener en rango
      normalized = normalized % totalHeight;
      if (normalized > 0) {
        normalized -= totalHeight;
      }
      // Asegurar que esté en un rango donde siempre se vean frutas
      // El rango visible es aproximadamente de -totalHeight a -REEL_HEIGHT
      while (normalized < -totalHeight + REEL_HEIGHT) {
        normalized += totalHeight;
      }
      while (normalized > -REEL_HEIGHT) {
        normalized -= totalHeight;
      }
      return normalized;
    };

    const targetY1 = normalizeValue(finalY1);
    const targetY2 = normalizeValue(finalY2);
    const targetY3 = normalizeValue(finalY3);

    // Animar rodillos con diferentes duraciones para efecto cascada
    Animated.parallel([
      Animated.timing(reel1Anim, {
        toValue: targetY1,
        duration: 2000 + Math.random() * 500,
        useNativeDriver: true,
      }),
      Animated.timing(reel2Anim, {
        toValue: targetY2,
        duration: 2200 + Math.random() * 500,
        useNativeDriver: true,
      }),
      Animated.timing(reel3Anim, {
        toValue: targetY3,
        duration: 2400 + Math.random() * 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Asegurar que los valores finales estén correctamente posicionados
      reel1Anim.setValue(targetY1);
      reel2Anim.setValue(targetY2);
      reel3Anim.setValue(targetY3);

      setIsSpinning(false);
      setResults([result1, result2, result3]);
      
      // Verificar si hay combinación ganadora
      if (result1.emoji === result2.emoji && result2.emoji === result3.emoji) {
        setHasWon(true);
      }
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

  const getTotalMultiplier = () => {
    if (results.length === 0) return 0;
    if (hasWon) {
      // Si hay 3 iguales, multiplicador x10
      return results[0].multiplier * 10;
    }
    // Suma de multiplicadores individuales
    return results.reduce((sum, fruit) => sum + fruit.multiplier, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Máquina de Azeroth</Text>
        <Text style={styles.headerSubtitle}>¡Gira los rodillos y gana tesoros!</Text>
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
        {results.length > 0 && (
          <View style={styles.resultContainer}>
            {hasWon ? (
              <>
                <Text style={styles.winTitle}>🎉 ¡TRIPLE GANADOR! 🎉</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    {results.map((item, index) => (
                      <View key={index} style={styles.resultFruit}>
                        <Text style={styles.resultEmoji}>{item.emoji}</Text>
                        <Text style={styles.resultName}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.resultMultiplier}>
                    Multiplicador Total: x{getTotalMultiplier()}
                  </Text>
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
                        <Text style={styles.resultMultiplierSmall}>
                          x{item.multiplier}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.resultTotal}>
                    Total: x{getTotalMultiplier()}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Botón de giro */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
            onPress={spinReels}
            disabled={isSpinning}
            activeOpacity={0.8}>
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'Girando...' : '🎰 Girar Rodillos'}
            </Text>
          </TouchableOpacity>

          <View style={styles.fruitsList}>
            <Text style={styles.fruitsListTitle}>Items disponibles:</Text>
            <View style={styles.fruitsGrid}>
              {wowItems.map((item, index) => (
                <View key={index} style={styles.fruitItem}>
                  <Text style={styles.fruitEmoji}>{item.emoji}</Text>
                  <Text style={styles.fruitName}>{item.name}</Text>
                  <Text style={styles.fruitMultiplier}>x{item.multiplier}</Text>
                </View>
              ))}
            </View>
            <View style={styles.bonusInfo}>
              <Text style={styles.bonusText}>
                💎 3 items iguales = Multiplicador x10
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
});

export default FruitWheelScreen;
