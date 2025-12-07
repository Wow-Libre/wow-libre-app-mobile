import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/login';
import RegisterScreen from './src/register'; // Ruta correcta para Register
import RecoveryPassword from './src/recovery_password';
import ProfileScreen from './src/profile';
import ShopScreen from './src/shop';
import FruitWheelScreen from './src/fruit_wheel';
import AccountsScreen from './src/accounts';
import HomeScreen from './src/home';
import CharactersScreen from './src/characters';
import PremiumScreen from './src/premium';
import PortalsScreen from './src/portals';
import TransactionsScreen from './src/transactions';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="RecoveryPassword"
          component={RecoveryPassword}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Shop"
          component={ShopScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="FruitWheel"
          component={FruitWheelScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Characters"
          component={CharactersScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Portals"
          component={PortalsScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
