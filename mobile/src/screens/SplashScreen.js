import React, { useEffect } from 'react'
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native'

export default function SplashScreen({ navigation }) {
  const opacite = new Animated.Value(0)
  const echelle = new Animated.Value(0.8)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacite, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(echelle, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start()

    const timer = setTimeout(() => {
      navigation.replace('Onboarding')
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4D8E" />
      <Animated.View style={[styles.logoContainer, { opacity: opacite, transform: [{ scale: echelle }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>W</Text>
        </View>
        <Text style={styles.nomApp}>WARI</Text>
        <Text style={styles.slogan}>Votre argent, simplement.</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4D8E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0A500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  logoText: { fontSize: 52, fontWeight: 'bold', color: '#FFFFFF' },
  nomApp: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 8 },
  slogan: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 10 }
})
