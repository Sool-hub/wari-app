import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { kycService } from '../services/api'

export default function ProfilScreen({ navigation }) {
  const { utilisateur, deconnexion } = useAuth()
  const [chargement, setChargement] = useState(false)

  const handleKYC = async () => {
    setChargement(true)
    try {
      const response = await kycService.initialiser()
      const url = response.data.data.url_verification
      Alert.alert(
        'Verification d\'identite',
        'Ouvrez ce lien pour verifier votre identite :\n\n' + url,
        [{ text: 'OK' }]
      )
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur KYC')
    } finally {
      setChargement(false)
    }
  }

  const handleDeconnexion = () => {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Deconnecter', style: 'destructive', onPress: deconnexion }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Mon profil</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarGrand}>
            <Text style={styles.avatarTexte}>
              {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
            </Text>
          </View>
          <Text style={styles.nomComplet}>
            {utilisateur?.prenom} {utilisateur?.nom}
          </Text>
          <Text style={styles.telephone}>+223 {utilisateur?.telephone}</Text>
          <View style={[
            styles.badgeKYC,
            utilisateur?.kyc_verifie ? styles.badgeKYCVerifie : styles.badgeKYCNonVerifie
          ]}>
            <Text style={styles.badgeKYCTexte}>
              {utilisateur?.kyc_verifie ? 'Identite verifiee' : 'Identite non verifiee'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Compte</Text>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>👤</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Nom complet</Text>
              <Text style={styles.itemValeur}>{utilisateur?.prenom} {utilisateur?.nom}</Text>
            </View>
            <Text style={styles.itemFleche}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>📱</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Telephone</Text>
              <Text style={styles.itemValeur}>+223 {utilisateur?.telephone}</Text>
            </View>
            <Text style={styles.itemFleche}>›</Text>
          </TouchableOpacity>

          {!utilisateur?.kyc_verifie && (
            <TouchableOpacity style={styles.item} onPress={handleKYC}>
              <Text style={styles.itemEmoji}>🪪</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemLabel}>Verifier mon identite</Text>
                <Text style={styles.itemSousTitre}>Requis pour utiliser toutes les fonctionnalites</Text>
              </View>
              {chargement ? (
                <ActivityIndicator color="#F0A500" size="small" />
              ) : (
                <Text style={styles.itemFleche}>›</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Securite</Text>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>🔑</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Changer mon PIN</Text>
            </View>
            <Text style={styles.itemFleche}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Application</Text>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>📋</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Conditions d'utilisation</Text>
            </View>
            <Text style={styles.itemFleche}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>🔒</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Politique de confidentialite</Text>
            </View>
            <Text style={styles.itemFleche}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemEmoji}>ℹ️</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Version</Text>
              <Text style={styles.itemValeur}>1.0.0</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.boutonDeconnexion} onPress={handleDeconnexion}>
          <Text style={styles.texteDeconnexion}>Se deconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30
  },
  avatarGrand: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0A500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarTexte: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  nomComplet: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  telephone: { fontSize: 16, color: '#8E8E93', marginBottom: 12 },
  badgeKYC: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20
  },
  badgeKYCVerifie: { backgroundColor: '#0D2E0D' },
  badgeKYCNonVerifie: { backgroundColor: '#2E1A00' },
  badgeKYCTexte: { fontSize: 13, color: '#30D158' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitre: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 2
  },
  itemEmoji: { fontSize: 20, marginRight: 14 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 16, color: '#FFFFFF' },
  itemValeur: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  itemSousTitre: { fontSize: 13, color: '#F0A500', marginTop: 2 },
  itemFleche: { fontSize: 20, color: '#3C3C3E' },
  boutonDeconnexion: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center'
  },
  texteDeconnexion: { fontSize: 16, color: '#DC2626', fontWeight: '600' }
})
