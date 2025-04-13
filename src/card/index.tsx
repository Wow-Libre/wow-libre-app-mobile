import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';

const Card = ({card}: any) => {
  const [flipped, setFlipped] = useState(false);
  const flipAnimation = new Animated.Value(0);

  const flipCard = () => {
    if (flipped) {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFlipped(false));
    } else {
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFlipped(true));
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{rotateY: frontInterpolate}],
  };

  const backAnimatedStyle = {
    transform: [{rotateY: backInterpolate}],
  };

  return (
    <TouchableOpacity onPress={flipCard}>
      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, frontAnimatedStyle, styles.cardFront]}>
          <Text style={styles.cardText}>Tap to Open</Text>
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.cardText}>{card.name}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardBack: {
    backgroundColor: '#f00',
    transform: [{rotateY: '180deg'}],
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Card;
