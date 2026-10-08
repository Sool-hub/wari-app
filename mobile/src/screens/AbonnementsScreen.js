import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert
} from 'react-native'
import { abonnementService } from '../services/api'

export default function AbonnementsScreen({ navigation }) {
  const [abonnements, setAbonnements] = useState([])
  const [totalMensuel, setTotalMensuel] = useState('0.00')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    chargerAbonnements()
  }, [])

  const chargerAbonnements = async () => {
    try {
      const response = await abonnementService.obtenirAbonnements()
      setAbonnements(response.data.data.abonnements)
      setTotalMensuel(response.data.data.total_mensuel)
    } catch (error) {
      console.log('Erreur abonnements:', error)
    } finally {
      setChargement(false)
    }
  }

  const handleAnnuler = (id, nom) => {
    Alert.alert(
      'Annuler abonnement',
      'Voulez-vous annuler l\'abonnement ' + nom + ' ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await abonnementService.annulerAbonnement(id)
              setAbonnements(prev => prev.filter(a => a.id !== id))
              Alert.alert('Succes', 'Abonnement annule avec succes')
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de l\'annulation')
            }
          }
        }
      ]
    )
  }

  const formaterDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  }

  const getFrequenceTexte = (frequence) => {
    if (frequence === 'mensuel') return '/mois'
    if (frequence === 'hebdomadaire') return '/semaine'
    if (frequence === 'annuel') return '/an'
    return ''
  }

  const renderAbonnement = ({ item }) => (
    <View style={styles.abonnementCard}>
      <View style={styles.abonnementHeader}>
        <View style={styles.abonnementIcone}>
          <Text style={styles.abonnementEmoji}>🔄</Text>
        </View>
        <View style={styles.abonnementInfo}>
          <Text style={styles.abonnementNom}>{item.nom_service}</Text>
          <Text style={styles.abonnementDate}>
            Prochain : {formaterDate(item.prochain_paiement)}
          </Text>
        </View>
        <View style={styles.abonnementMontantContainer}>
          <Text style={styles.abonnementMontant}>
            {parseFloat(item.montant).toLocaleString('fr-FR')} F
          </Text>
          <Text style={styles.abonnementFrequence}>
            {getFrequenceTexte(item.frequence)}
          </Text>
        </View>
      </View>
      {item.detection_auto && (
        <View style={styles.badgeAuto}>
          <Text style={styles.badgeAutoTexte}>Detecte automatiquement</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.boutonAnnuler}
        onPress={() => handleAnnuler(item.id, item.nom_service)}
      >
        <Text style={styles.texteAnnuler}>Annuler</Text>
      </TouchableOpacity>
    </View>
  )

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
        <Text style={styles.titrePage}>Abonnements</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.resumeContainer}>
        <Text style={styles.resumeLabel}>Total mensuel</Text>
        <Text style={styles.resumeMontant}>
          {parseFloat(totalMensuel).toLocaleString('fr-FR')} XOF
        </Text>
        <Text style={styles.resumeSousTitre}>{abonnements.length} abonnement(s) actif(s)</Text>
      </View>

      <FlatList
        data={abonnements}
        renderItem={renderAbonnement}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>📋</Text>
            <Text style={styles.videTexte}>Aucun abonnement detecte</Text>
            <Text style={styles.videDescription}>
              Vos abonnements payes avec votre carte Wari apparaitront automatiquement ici
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  chargementContainer: {
    flex: 1, backgroundColor: '#0A0A0A',
    alignItems: 'center', justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20
  },
  retour: { fontSize: 24, color: '#FFFFFF' },
  titrePage: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  resumeContainer: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center'
  },
  resumeLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  resumeMontant: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  resumeSousTitre: { fontSize: 14, color: '#8E8E93' },
  liste: { paddingHorizontal: 16 },
  abonnementCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  abonnementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  abonnementIcone: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  abonnementEmoji: { fontSize: 20 },
  abonnementInfo: { flex: 1 },
  abonnementNom: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  abonnementDate: { fontSize: 13, color: '#8E8E93' },
  abonnementMontantContainer: { alignItems: 'flex-end' },
  abonnementMontant: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  abonnementFrequence: { fontSize: 13, color: '#8E8E93' },
  badgeAuto: {
    backgroundColor: '#0D2E0D',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  badgeAutoTexte: { fontSize: 12, color: '#30D158' },
  boutonAnnuler: {
    borderWidth: 1,
    borderColor: '#3C3C3E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  texteAnnuler: { fontSize: 14, color: '#DC2626' },
  vide: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  videEmoji: { fontSize: 50, marginBottom: 16 },
  videTexte: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  videDescription: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22 }
})
