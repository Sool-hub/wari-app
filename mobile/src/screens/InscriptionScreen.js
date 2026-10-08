import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function InscriptionScreen({ navigation }) {
  const [etape, setEtape] = useState(1)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [chargement, setChargement] = useState(false)
  const { inscription } = useAuth()

  const etapeSuivante = () => {
    if (etape === 1) {
      if (!nom || !prenom) {
        Alert.alert('Erreur', 'Entrez votre nom et prenom')
        return
      }
      if (!telephone || telephone.length !== 8) {
        Alert.alert('Erreur', 'Entrez un numero valide a 8 chiffres')
        return
      }
      setEtape(2)
    }
  }

  const handleInscription = async () => {
    if (pin.length !== 4) {
      Alert.alert('Erreur', 'Le PIN doit contenir 4 chiffres')
      return
    }
    if (pin !== pinConfirm) {
      Alert.alert('Erreur', 'Les PIN ne correspondent pas')
      return
    }

    setChargement(true)
    try {
      await inscription({ nom, prenom, telephone, pin, date_naissance: dateNaissance || undefined })
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de l\'inscription')
      setChargement(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => etape === 1 ? navigation.goBack() : setEtape(1)}>
          <Text style={styles.retour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Creer un compte</Text>
        <Text style={styles.etapeIndicateur}>{etape}/2</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBarre, { width: etape === 1 ? '50%' : '100%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.contenu}>
        {etape === 1 ? (
          <>
            <Text style={styles.titreEtape}>Vos informations</Text>
            <Text style={styles.descriptionEtape}>
              Ces informations seront utilisees pour verifier votre identite
            </Text>

            <Text style={styles.label}>Prenom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prenom"
              placeholderTextColor="#3C3C3E"
              value={prenom}
              onChangeText={setPrenom}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom de famille"
              placeholderTextColor="#3C3C3E"
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Numero de telephone</Text>
            <View style={styles.inputAvecPrefixe}>
              <Text style={styles.prefixe}>+223</Text>
              <TextInput
                style={styles.inputInline}
                placeholder="XX XX XX XX"
                placeholderTextColor="#3C3C3E"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            <Text style={styles.label}>Date de naissance (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#3C3C3E"
              value={dateNaissance}
              onChangeText={setDateNaissance}
            />
          </>
        ) : (
          <>
            <Text style={styles.titreEtape}>Creez votre PIN</Text>
            <Text style={styles.descriptionEtape}>
              Votre PIN a 4 chiffres securise votre compte. Ne le partagez jamais.
            </Text>

            <Text style={styles.label}>PIN (4 chiffres)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor="#3C3C3E"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmer le PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor="#3C3C3E"
              value={pinConfirm}
              onChangeText={setPinConfirm}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />

            <View style={styles.avertissement}>
              <Text style={styles.avertissementTexte}>
                En creant votre compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialite.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {etape === 1 ? (
          <TouchableOpacity style={styles.bouton} onPress={etapeSuivante}>
            <Text style={styles.texteBouton}>Continuer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.bouton, chargement && styles.boutonDesactive]}
            onPress={handleInscription}
            disabled={chargement}
          >
            {chargement ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.texteBouton}>Creer mon compte</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16
  },
  retour: { fontSize: 24, color: '#FFFFFF' },
  titrePage: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  etapeIndicateur: { fontSize: 14, color: '#8E8E93' },
  progressContainer: {
    height: 3,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 24
  },
  progressBarre: {
    height: 3,
    backgroundColor: '#F0A500',
    borderRadius: 2
  },
  contenu: { flex: 1, paddingHorizontal: 16 },
  titreEtape: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  descriptionEtape: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 32
  },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#FFFFFF'
  },
  inputAvecPrefixe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56
  },
  prefixe: { fontSize: 16, color: '#8E8E93', marginRight: 8 },
  inputInline: { flex: 1, fontSize: 16, color: '#FFFFFF' },
  avertissement: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 24
  },
  avertissementTexte: { fontSize: 13, color: '#8E8E93', lineHeight: 20 },
  footer: { padding: 16, paddingBottom: 34 },
  bouton: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center'
  },
  boutonDesactive: { opacity: 0.6 },
  texteBouton: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }
})
