import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator
} from 'react-native'
import { useAuth } from '../context/AuthContext'

const CHIFFRES = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function ConnexionScreen({ navigation }) {
  const [telephone, setTelephone] = useState('')
  const [pin, setPin] = useState('')
  const [etape, setEtape] = useState('telephone')
  const [chargement, setChargement] = useState(false)
  const { connexion } = useAuth()

  const gererSaisie = (valeur) => {
    if (etape === 'telephone') {
      if (valeur === '⌫') {
        setTelephone(prev => prev.slice(0, -1))
      } else if (valeur !== '' && telephone.length < 8) {
        setTelephone(prev => prev + valeur)
      }
    } else {
      if (valeur === '⌫') {
        setPin(prev => prev.slice(0, -1))
      } else if (valeur !== '' && pin.length < 4) {
        const nouveauPin = pin + valeur
        setPin(nouveauPin)
        if (nouveauPin.length === 4) {
          handleConnexion(nouveauPin)
        }
      }
    }
  }

  const handleConnexion = async (pinSaisi) => {
    setChargement(true)
    try {
      await connexion(telephone, pinSaisi)
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur de connexion'
      Alert.alert('Erreur', msg)
      setPin('')
    } finally {
      setChargement(false)
    }
  }

  const afficherTelephone = () => {
    if (telephone.length === 0) return '__ __ __ __'
    const t = telephone.padEnd(8, '_')
    return t.slice(0,2) + ' ' + t.slice(2,4) + ' ' + t.slice(4,6) + ' ' + t.slice(6,8)
  }

  const afficherPin = () => {
    return Array(4).fill(0).map((_, i) => (
      <View
        key={i}
        style={[
          styles.pointPin,
          i < pin.length ? styles.pointPinActif : styles.pointPinInactif
        ]}
      />
    ))
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <View style={styles.logoMini}>
          <Text style={styles.logoTexte}>W</Text>
        </View>
        <Text style={styles.titre}>WARI</Text>
      </View>

      <View style={styles.contenu}>
        {etape === 'telephone' ? (
          <>
            <Text style={styles.instruction}>Entrez votre numero</Text>
            <Text style={styles.valeurSaisie}>{afficherTelephone()}</Text>
            {telephone.length === 8 && (
              <TouchableOpacity
                style={styles.boutonContinuer}
                onPress={() => setEtape('pin')}
              >
                <Text style={styles.texteBouton}>Continuer</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.instruction}>Entrez votre PIN</Text>
            <View style={styles.pinsContainer}>
              {afficherPin()}
            </View>
            {chargement && (
              <ActivityIndicator color="#F0A500" size="large" style={{ marginTop: 20 }} />
            )}
          </>
        )}
      </View>

      <View style={styles.clavier}>
        {CHIFFRES.map((chiffre, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.touche,
              chiffre === '' && styles.toucheVide
            ]}
            onPress={() => chiffre !== '' && gererSaisie(chiffre)}
            disabled={chiffre === ''}
          >
            <Text style={styles.texteChiffre}>{chiffre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.lienInscription}
        onPress={() => navigation.navigate('Inscription')}
      >
        <Text style={styles.texteInscription}>
          Pas encore de compte ? <Text style={styles.texteAccent}>Creer un compte</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A'
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20
  },
  logoMini: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0A500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  logoTexte: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  titre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 6
  },
  contenu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  instruction: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20
  },
  valeurSaisie: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 30
  },
  pinsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30
  },
  pointPin: {
    width: 18,
    height: 18,
    borderRadius: 9
  },
  pointPinActif: {
    backgroundColor: '#F0A500'
  },
  pointPinInactif: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#3C3C3E'
  },
  boutonContinuer: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    marginTop: 10
  },
  texteBouton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  clavier: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 30,
    paddingBottom: 20
  },
  touche: {
    width: '33.33%',
    height: 75,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toucheVide: {
    opacity: 0
  },
  texteChiffre: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF'
  },
  lienInscription: {
    alignItems: 'center',
    paddingBottom: 40
  },
  texteInscription: {
    fontSize: 15,
    color: '#8E8E93'
  },
  texteAccent: {
    color: '#F0A500',
    fontWeight: '600'
  }
})
