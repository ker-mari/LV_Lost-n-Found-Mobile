import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['InteractionManager']);

import WelcomeScreen from './src/screens/WelcomeScreen';
import PinScreen from './src/screens/PinScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HandOverForm from './src/screens/HandOverForm';
import ViewItemScreen from './src/screens/ViewItemScreen';
import ClaimForm from './src/screens/ClaimItemsForm';
import ItemsToClearScreen from './src/screens/ItemsToBeClearedScreen';
import ApprovalQueuesScreen from './src/screens/ApprovalQueuesScreen';
import HistoryPage from './src/screens/HistoryScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Pin" component={PinScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="HandOver" component={HandOverForm} />
          <Stack.Screen name="ViewItem" component={ViewItemScreen} />
          <Stack.Screen name="Claim" component={ClaimForm} />
          <Stack.Screen name="ItemsToClear" component={ItemsToClearScreen} />
          <Stack.Screen name="ApprovalQueues" component={ApprovalQueuesScreen} />
          <Stack.Screen name="History" component={HistoryPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
