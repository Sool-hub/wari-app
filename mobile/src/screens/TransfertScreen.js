import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native'
import { compteService } from '../services/api'

const MONTANTS_RAPIDES = [500, 1000, 2000, 5000, 10000, 25000]

export default function TransfertScreen({ navigation }) {
  const [telephone, setTelephone] = useState('')
  const [montant, setMontant] = useState('')
  const [description, setDescription] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleTransfert = async () => {
    if (!telephone || telephone.length !== 8) {
      Alert.alert('Erreur', 'Entrez un numero Wari valide a 8 chiffres')
      return
    }
    if (!montant || parseFloat(montant) < 100) {
      Alert.alert('Erreur', 'Le montant minimum est 100 XOF')
      return
    }

    setChargement(true)
    try {
      const response = await compteService.transferer({
        telephone_destinataire: telephone,
        montant: parseFloat(montant),
        description: description || 'Transfert Wari'
      })
      const dest = response.data.data.destinataire
      Alert.alert(
        'Transfert reussi',
        montant + ' XOF envoyes a ' + dest.prenom + ' ' + dest.nom + '\nNouveau solde : ' + response.data.data.nouveau_solde + ' XOF',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors du transfert')
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
        <Text style={styles.titrePage}>Transfert</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.contenu}>
        <Text style={styles.sectionLabel}>Numero Wari du destinataire</Text>
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

        <Text style={styles.sectionLabel}>Note (optionnel)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Remboursement, cadeau..."
            placeholderTextColor="#3C3C3E"
            value={description}
            onChangeText={setDescription}
            maxLength={100}
          />
        </View>

        {montant !== '' && telephone.length === 8 && (
          <View style={styles.resumeContainer}>
            <View style={styles.resumeLigne}>
              <Text style={styles.resumeLabel}>Destinataire</Text>
              <Text style={styles.resumeValeur}>+223 {telephone}</Text>
            </View>
            <View style={styles.resumeLigne}>
              <Text style={styles.resumeLabel}>Montant</Text>
              <Text style={styles.resumeValeur}>{parseFloat(montant || 0).toLocaleString('fr-FR')} XOF</Text>
            </View>
            <View style={styles.resumeLigne}>
              <Text style={styles.resumeLabel}>Frais</Text>
              <Text style={styles.resumeValeurSucces}>Gratuit</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.boutonTransferer, chargement && styles.boutonDesactive]}
          onPress={handleTransfert}
          disabled={chargement}
        >
          {chargement ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.texteBouton}>Envoyer</Text>
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
  resumeValeurSucces: { fontSize: 15, color: '#30D158', fontWeight: '600' },
  footer: { padding: 16, paddingBottom: 34 },
  boutonTransferer: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center'
  },
  boutonDesactive: { opacity: 0.6 },
  texteBouton: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }
})
