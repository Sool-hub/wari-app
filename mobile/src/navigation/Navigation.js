import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View } from 'react-native'

import SplashScreen from '../screens/SplashScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import ConnexionScreen from '../screens/ConnexionScreen'
import InscriptionScreen from '../screens/InscriptionScreen'
import DashboardScreen from '../screens/DashboardScreen'
import CarteScreen from '../screens/CarteScreen'
import RechargeScreen from '../screens/RechargeScreen'
import TransfertScreen from '../screens/TransfertScreen'
import HistoriqueScreen from '../screens/HistoriqueScreen'
import AbonnementsScreen from '../screens/AbonnementsScreen'

const Stack = createNativeStackNavigator()

export default function Navigation() {
  const { utilisateur, chargement } = useAuth()

  if (chargement) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#F0A500" size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!utilisateur ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Connexion" component={ConnexionScreen} />
            <Stack.Screen name="Inscription" component={InscriptionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Carte" component={CarteScreen} />
            <Stack.Screen name="Recharge" component={RechargeScreen} />
            <Stack.Screen name="Transfert" component={TransfertScreen} />
            <Stack.Screen name="Historique" component={HistoriqueScreen} />
            <Stack.Screen name="Abonnements" component={AbonnementsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
