import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import Card from '../card';

const MainScreen = () => {
  const card = {name: 'Carta Especial'};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardWrapper}>
        <Card card={card} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainScreen;
