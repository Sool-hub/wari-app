import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, ScrollView
} from 'react-native'
import { carteService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CarteScreen({ navigation }) {
  const { utilisateur } = useAuth()
  const [carte, setCarte] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [detailsVisibles, setDetailsVisibles] = useState(false)
  const [action, setAction] = useState(null)

  useEffect(() => {
    chargerCarte()
  }, [])

  const chargerCarte = async () => {
    try {
      const response = await carteService.obtenirCarte()
      setCarte(response.data.data)
    } catch (error) {
      if (error.response?.status === 404) {
        setCarte(null)
      }
    } finally {
      setChargement(false)
    }
  }

  const creerCarte = async () => {
    setAction('creation')
    try {
      const response = await carteService.creerCarte()
      setCarte(response.data.data)
      Alert.alert('Succes', 'Votre carte virtuelle a ete creee avec succes')
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la creation')
    } finally {
      setAction(null)
    }
  }

  const toggleBlocage = async () => {
    setAction('blocage')
    try {
      if (carte.statut === 'active') {
        await carteService.bloquerCarte()
        setCarte(prev => ({ ...prev, statut: 'bloquee' }))
        Alert.alert('Carte bloquee', 'Votre carte a ete bloquee avec succes')
      } else {
        await carteService.debloquerCarte()
        setCarte(prev => ({ ...prev, statut: 'active' }))
        Alert.alert('Carte debloquee', 'Votre carte a ete debloquee avec succes')
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setAction(null)
    }
  }

  if (chargement) {
    return (
      <View style={styles.chargementContainer}>
        <ActivityIndicator color="#F0A500" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Carte</Text>
        <Text style={styles.aide}>Besoin d'aide ?</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!carte ? (
          <View style={styles.pasDeCarteContainer}>
            <Text style={styles.pasDeCarteEmoji}>💳</Text>
            <Text style={styles.pasDeCarteTitre}>Pas encore de carte</Text>
            <Text style={styles.pasDeCarteDescription}>
              Creez votre carte virtuelle Wari pour payer en ligne partout dans le monde
            </Text>
            <TouchableOpacity style={styles.boutonCreer} onPress={creerCarte}>
              {action === 'creation' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.texteBoutonCreer}>Creer ma carte virtuelle</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.carteVisuelle}>
              <View style={styles.carteEntete}>
                <Text style={styles.carteNomApp}>wari</Text>
                <Text style={styles.carteNomAppDroit}>wari</Text>
              </View>

              <TouchableOpacity
                style={styles.oeilContainer}
                onPress={() => setDetailsVisibles(!detailsVisibles)}
              >
                <Text style={styles.oeil}>{detailsVisibles ? '🙈' : '👁'}</Text>
              </TouchableOpacity>

              <Text style={styles.carteTitulaire}>
                {utilisateur?.prenom?.toUpperCase()} {utilisateur?.nom?.toUpperCase()}
              </Text>

              <View style={styles.carteBas}>
                <Text style={styles.carteNumero}>
                  {detailsVisibles ? carte.numero_masque : '**** **** **** ****'}
                </Text>
                <Text style={styles.carteVisa}>VISA</Text>
              </View>

              {detailsVisibles && (
                <Text style={styles.carteExpiration}>
                  Exp: {carte.date_expiration}
                </Text>
              )}

              {carte.statut === 'bloquee' && (
                <View style={styles.carteBloqueeOverlay}>
                  <Text style={styles.carteBloqueeTexte}>BLOQUEE</Text>
                </View>
              )}
            </View>

            <View style={styles.actionsCarteContainer}>
              <TouchableOpacity style={styles.actionCarte} onPress={toggleBlocage}>
                <View style={styles.actionCarteIcone}>
                  {action === 'blocage' ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.actionCarteEmoji}>
                      {carte.statut === 'active' ? '🔒' : '🔓'}
                    </Text>
                  )}
                </View>
                <Text style={styles.actionCarteLabel}>
                  {carte.statut === 'active' ? 'Verrouiller' : 'Deverrouiller'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCarte}
                onPress={() => navigation.navigate('Abonnements')}
              >
                <View style={styles.actionCarteIcone}>
                  <Text style={styles.actionCarteEmoji}>🔄</Text>
                </View>
                <Text style={styles.actionCarteLabel}>Abonnements</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCarte}>
                <View style={styles.actionCarteIcone}>
                  <Text style={styles.actionCarteEmoji}>⚙️</Text>
                </View>
                <Text style={styles.actionCarteLabel}>Parametres</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plafondContainer}>
              <Text style={styles.plafondLabel}>Plafond transaction du mois</Text>
              <View style={styles.plafondBarre}>
                <View style={[styles.plafondRempli, { width: '0.1%' }]} />
              </View>
              <Text style={styles.plafondValeur}>
                0 / {parseFloat(carte.plafond_journalier).toLocaleString('fr-FR')}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A'
  },
  chargementContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20
  },
  retour: {
    fontSize: 24,
    color: '#FFFFFF'
  },
  titrePage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  aide: {
    fontSize: 14,
    color: '#8E8E93'
  },
  pasDeCarteContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60
  },
  pasDeCarteEmoji: {
    fontSize: 70,
    marginBottom: 20
  },
  pasDeCarteTitre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12
  },
  pasDeCarteDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40
  },
  boutonCreer: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center'
  },
  texteBoutonCreer: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  carteVisuelle: {
    marginHorizontal: 16,
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden'
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  carteNomApp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E'
  },
  carteNomAppDroit: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    opacity: 0.4
  },
  oeilContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  oeil: {
    fontSize: 22
  },
  carteTitulaire: {
    fontSize: 14,
    color: '#1A1A2E',
    letterSpacing: 1,
    marginBottom: 20
  },
  carteBas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  carteNumero: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: 2
  },
  carteVisa: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    fontStyle: 'italic'
  },
  carteExpiration: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 8
  },
  carteBloqueeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  carteBloqueeTexte: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    letterSpacing: 4
  },
  actionsCarteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30
  },
  actionCarte: {
    alignItems: 'center',
    gap: 8
  },
  actionCarteIcone: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionCarteEmoji: {
    fontSize: 24
  },
  actionCarteLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4
  },
  plafondContainer: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30
  },
  plafondLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12
  },
  plafondBarre: {
    height: 4,
    backgroundColor: '#3C3C3E',
    borderRadius: 2,
    marginBottom: 8
  },
  plafondRempli: {
    height: 4,
    backgroundColor: '#F0A500',
    borderRadius: 2
  },
  plafondValeur: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'right'
  }
})
