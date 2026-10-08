import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native'
import { compteService } from '../services/api'

const OPERATEURS = [
  { id: 'orange_money', nom: 'Orange Money', couleur: '#FF6600', emoji: '🟠' },
  { id: 'wave', nom: 'Wave', couleur: '#0066FF', emoji: '🔵' }
]

const MONTANTS_RAPIDES = [1000, 2000, 5000, 10000, 25000, 50000]

export default function RechargeScreen({ navigation }) {
  const [operateur, setOperateur] = useState(null)
  const [montant, setMontant] = useState('')
  const [telephone, setTelephone] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleRecharge = async () => {
    if (!operateur) {
      Alert.alert('Erreur', 'Choisissez un operateur')
      return
    }
    if (!montant || parseFloat(montant) < 500) {
      Alert.alert('Erreur', 'Le montant minimum est 500 XOF')
      return
    }
    if (!telephone || telephone.length !== 8) {
      Alert.alert('Erreur', 'Entrez un numero valide a 8 chiffres')
      return
    }

    setChargement(true)
    try {
      const response = await compteService.recharger({
        montant: parseFloat(montant),
        operateur: operateur.id,
        telephone_mobile_money: telephone
      })
      Alert.alert(
        'Recharge reussie',
        'Votre compte a ete credite de ' + montant + ' XOF\nNouveau solde : ' + response.data.data.nouveau_solde + ' XOF',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la recharge')
    } finally {
      setChargement(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Deposer de l'argent</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.contenu}>
        <Text style={styles.sectionLabel}>Choisissez votre operateur</Text>
        <View style={styles.operateursContainer}>
          {OPERATEURS.map(op => (
            <TouchableOpacity
              key={op.id}
              style={[
                styles.operateurCard,
                operateur?.id === op.id && styles.operateurSelectionne
              ]}
              onPress={() => setOperateur(op)}
            >
              <Text style={styles.operateurEmoji}>{op.emoji}</Text>
              <Text style={styles.operateurNom}>{op.nom}</Text>
              {operateur?.id === op.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkTexte}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Numero {operateur?.nom || 'Mobile Money'}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixe}>+223</Text>
          <TextInput
            style={styles.input}
            placeholder="XX XX XX XX"
            placeholderTextColor="#3C3C3E"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="numeric"
            maxLength={8}
          />
        </View>

        <Text style={styles.sectionLabel}>Montant (XOF)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="0"
            placeholderTextColor="#3C3C3E"
            value={montant}
            onChangeText={setMontant}
            keyboardType="numeric"
          />
          <Text style={styles.devise}>XOF</Text>
        </View>

        <View style={styles.montantsRapidesContainer}>
          {MONTANTS_RAPIDES.map(m => (
            <TouchableOpacity
              key={m}
              style={[
                styles.montantRapide,
                montant === String(m) && styles.montantRapideSelectionne
              ]}
              onPress={() => setMontant(String(m))}
            >
              <Text style={[
                styles.montantRapideTexte,
                montant === String(m) && styles.montantRapideTexteSelectionne
              ]}>
                {m.toLocaleString('fr-FR')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {montant !== '' && (
          <View style={styles.resumeContainer}>
            <View style={styles.resumeLigne}>
              <Text style={styles.resumeLabel}>Montant</Text>
              <Text style={styles.resumeValeur}>{parseFloat(montant || 0).toLocaleString('fr-FR')} XOF</Text>
            </View>
            <View style={styles.resumeLigne}>
              <Text style={styles.resumeLabel}>Frais</Text>
              <Text style={styles.resumeValeur}>0 XOF</Text>
            </View>
            <View style={[styles.resumeLigne, styles.resumeTotal]}>
              <Text style={styles.resumeTotalLabel}>Total debite</Text>
              <Text style={styles.resumeTotalValeur}>{parseFloat(montant || 0).toLocaleString('fr-FR')} XOF</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.boutonRecharger, chargement && styles.boutonDesactive]}
          onPress={handleRecharge}
          disabled={chargement}
        >
          {chargement ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.texteBouton}>Recharger</Text>
          )}
        </TouchableOpacity>
      </View>
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
  contenu: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    marginTop: 24
  },
  operateursContainer: { flexDirection: 'row', gap: 12 },
  operateurCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  operateurSelectionne: { borderColor: '#F0A500' },
  operateurEmoji: { fontSize: 32, marginBottom: 8 },
  operateurNom: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  checkmark: {
    position: 'absolute',
    top: 8, right: 8,
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: '#F0A500',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkmarkTexte: { fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56
  },
  prefixe: { fontSize: 16, color: '#8E8E93', marginRight: 8 },
  devise: { fontSize: 16, color: '#8E8E93' },
  input: { flex: 1, fontSize: 18, color: '#FFFFFF' },
  montantsRapidesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16
  },
  montantRapide: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E'
  },
  montantRapideSelectionne: { borderColor: '#F0A500', backgroundColor: '#2C1A00' },
  montantRapideTexte: { fontSize: 14, color: '#8E8E93' },
  montantRapideTexteSelectionne: { color: '#F0A500' },
  resumeContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginTop: 24
  },
  resumeLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  resumeLabel: { fontSize: 15, color: '#8E8E93' },
  resumeValeur: { fontSize: 15, color: '#FFFFFF' },
  resumeTotal: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    marginTop: 8,
    paddingTop: 16
  },
  resumeTotalLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  resumeTotalValeur: { fontSize: 16, fontWeight: '600', color: '#F0A500' },
  footer: { padding: 16, paddingBottom: 34 },
  boutonRecharger: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center'
  },
  boutonDesactive: { opacity: 0.6 },
  texteBouton: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }
})
