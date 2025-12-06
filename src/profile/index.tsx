import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Images} from '../constant';

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
}

const StatBar: React.FC<StatBarProps> = ({label, value, maxValue, color, icon}) => {
  const [animatedWidth] = useState(new Animated.Value(0));
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.statBarContainer}>
      <View style={styles.statBarHeader}>
        <Text style={styles.statBarIcon}>{icon}</Text>
        <Text style={styles.statBarLabel}>{label}</Text>
        <Text style={styles.statBarValue}>
          {value}/{maxValue}
        </Text>
      </View>
      <View style={styles.statBarBackground}>
        <Animated.View
          style={[
            styles.statBarFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const ProfileScreen = ({navigation, route}: {navigation: any; route?: any}): React.JSX.Element => {
  const character = route?.params?.character;
  const account = route?.params?.account;
  const [characterStats, setCharacterStats] = useState({
    life: 85,
    fun: 60,
    thirst: 40,
  });

  const [messages, setMessages] = useState([
    '¡Hola! ¿Cómo estás hoy? 😊',
    'Me siento con mucha energía ⚡',
    '¿Quieres jugar algo? 🎮',
    '¡Cuida mis estadísticas! 📊',
    'Tengo sed, ¿me ayudas? 💧',
    '¡Estoy listo para la aventura! ⚔️',
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [bubbleScaleAnim] = useState(new Animated.Value(0));
  const [breathingAnim] = useState(new Animated.Value(1));
  const [typingAnim] = useState(new Animated.Value(0));
  const [isTyping, setIsTyping] = useState(false);

  // Breathing animation for character
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, []);

  // Message rotation with typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      typingAnim.setValue(0);
      
      // Hide bubble and show typing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentMessageIndex(prev => (prev + 1) % messages.length);
        
        // Show typing animation
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setIsTyping(false);
          
          // Show new message with scale animation
          bubbleScaleAnim.setValue(0);
          Animated.parallel([
            Animated.spring(bubbleScaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  // Initial bubble animation
  useEffect(() => {
    Animated.spring(bubbleScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStatAction = (stat: 'life' | 'fun' | 'thirst', amount: number) => {
    setCharacterStats(prev => ({
      ...prev,
      [stat]: Math.min(100, Math.max(0, prev[stat] + amount)),
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Administración del Personaje</Text>
            {character && (
              <Text style={styles.headerSubtitle}>
                {character.name} - {account?.realm || 'Reino desconocido'}
              </Text>
            )}
            {!character && (
              <Text style={styles.headerSubtitle}>Gestiona tu personaje</Text>
            )}
          </View>
        </View>

        {/* Character Card */}
        <View style={styles.characterCard}>
          <Animated.View
            style={[
              styles.characterImageContainer,
              {
                transform: [
                  {
                    scale: breathingAnim,
                  },
                ],
              },
            ]}>
            <Image
              source={{
                uri: character?.race_logo  || Images.WOW_ICON,
              }}
              style={styles.characterImage}
              resizeMode="contain"
              defaultSource={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
              }}
            />
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.characterGlow,
                {
                  opacity: breathingAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [0.3, 0.6],
                  }),
                },
              ]}
            />
          </Animated.View>

          {/* Speech Bubble */}
          {isTyping ? (
            <Animated.View
              style={[
                styles.speechBubble,
                styles.typingBubble,
                {
                  opacity: typingAnim,
                  transform: [{scale: bubbleScaleAnim}],
                },
              ]}>
              <View style={styles.speechBubbleContent}>
                <View style={styles.typingIndicator}>
                  <Animated.View
                    style={[
                      styles.typingDot,
                      {
                        opacity: typingAnim.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.4, 1, 0.4, 0.4],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      {
                        opacity: typingAnim.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.4, 0.4, 1, 0.4],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      {
                        opacity: typingAnim.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.4, 0.4, 0.4, 1],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.speechBubbleTail} />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.speechBubble,
                {
                  opacity: fadeAnim,
                  transform: [{scale: bubbleScaleAnim}],
                },
              ]}>
              <View style={styles.speechBubbleContent}>
                <Text style={styles.speechBubbleText}>
                  {messages[currentMessageIndex]}
                </Text>
              </View>
              <View style={styles.speechBubbleTail} />
              {/* Pulse effect on bubble */}
              <Animated.View
                style={[
                  styles.bubblePulse,
                  {
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    transform: [
                      {
                        scale: breathingAnim.interpolate({
                          inputRange: [1, 1.05],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>

          <StatBar
            label="Comida"
            value={characterStats.life}
            maxValue={100}
            color="#ef4444"
            icon="🍔"
          />

          <StatBar
            label="Diversión"
            value={characterStats.fun}
            maxValue={100}
            color="#f59e0b"
            icon="🎮"
          />

          <StatBar
            label="Sed"
            value={characterStats.thirst}
            maxValue={100}
            color="#3b82f6"
            icon="💧"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.lifeButton]}
              onPress={() => handleStatAction('life', 10)}
              activeOpacity={0.8}>
              <Text style={styles.actionButtonIcon}>🍔</Text>
              <Text style={styles.actionButtonText}>+ Comida</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.funButton]}
              onPress={() => handleStatAction('fun', 10)}
              activeOpacity={0.8}>
              <Text style={styles.actionButtonIcon}>🎮</Text>
              <Text style={styles.actionButtonText}>+ Diversión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.thirstButton]}
              onPress={() => handleStatAction('thirst', 10)}
              activeOpacity={0.8}>
              <Text style={styles.actionButtonIcon}>💧</Text>
              <Text style={styles.actionButtonText}>+ Sed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Character Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Estado del Personaje</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nivel:</Text>
            <Text style={styles.infoValue}>15</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experiencia:</Text>
            <Text style={styles.infoValue}>2,450 / 3,000</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>
              Activo
            </Text>
          </View>
        </View>

        {/* Shop Button */}
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.8}>
          <Text style={styles.shopButtonIcon}>🛒</Text>
          <Text style={styles.shopButtonText}>Visitar Tienda</Text>
          <Text style={styles.shopButtonArrow}>→</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '400',
  },
  characterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#1e88e5',
    position: 'relative',
    overflow: 'hidden',
  },
  characterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: 2,
  },
  characterGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1e88e5',
    zIndex: 1,
  },
  speechBubble: {
    position: 'relative',
    backgroundColor: '#1e88e5',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: '90%',
    marginTop: 8,
    shadowColor: '#1e88e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  typingBubble: {
    minWidth: 80,
  },
  speechBubbleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubbleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 3,
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1e88e5',
    zIndex: 1,
  },
  bubblePulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: '#1e88e5',
    zIndex: -1,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  statBarContainer: {
    marginBottom: 20,
  },
  statBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBarIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statBarLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  statBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  statBarBackground: {
    height: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  lifeButton: {
    borderColor: '#ef4444',
  },
  funButton: {
    borderColor: '#f59e0b',
  },
  thirstButton: {
    borderColor: '#3b82f6',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoLabel: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  statusActive: {
    color: '#10b981',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shopButtonIcon: {
    fontSize: 28,
  },
  shopButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffd700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  shopButtonArrow: {
    fontSize: 24,
    color: '#ffd700',
    fontWeight: '700',
  },
});

export default ProfileScreen;

