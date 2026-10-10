import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { compteService } from '../services/api'

const ACTIONS = [
  { id: 'recharge', emoji: '💳', label: 'Deposer' },
  { id: 'transfert', emoji: '↗', label: 'Transfert' },
  { id: 'carte', emoji: '🃏', label: 'Ma carte' },
  { id: 'abonnements', emoji: '🔄', label: 'Abonnements' }
]

export default function DashboardScreen({ navigation }) {
  const { utilisateur } = useAuth()
  const [solde, setSolde] = useState('0.00')
  const [transactions, setTransactions] = useState([])
  const [chargement, setChargement] = useState(true)
  const [rafraichissement, setRafraichissement] = useState(false)
  const [soldeVisible, setSoldeVisible] = useState(true)

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const response = await compteService.obtenirSolde()
      setSolde(response.data.data.solde)
      setTransactions(response.data.data.dernieres_transactions || [])
    } catch (error) {
      console.log('Erreur chargement:', error)
    } finally {
      setChargement(false)
      setRafraichissement(false)
    }
  }

  const onRafraichir = () => {
    setRafraichissement(true)
    chargerDonnees()
  }

  const formaterMontant = (montant) => {
    return parseFloat(montant).toLocaleString('fr-FR') + ' F'
  }

  const formaterDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
      ' - ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getIconeTransaction = (type) => {
    if (type === 'recharge') return '↙'
    if (type === 'transfert') return '↗'
    if (type === 'paiement_marchand') return '🛒'
    return '💳'
  }

  const getCouleurMontant = (type) => {
    if (type === 'recharge') return '#30D158'
    return '#FFFFFF'
  }

  const getPrefixeMontant = (type) => {
    if (type === 'recharge') return '+'
    return '-'
  }

  const gererAction = (id) => {
    switch (id) {
      case 'recharge': navigation.navigate('Recharge'); break
      case 'transfert': navigation.navigate('Transfert'); break
      case 'carte': navigation.navigate('Carte'); break
      case 'abonnements': navigation.navigate('Abonnements'); break
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={onRafraichir}
            tintColor="#F0A500"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTexte}>
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.bonjour}>Bonjour {utilisateur?.prenom}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
            <Text style={styles.texteParametres}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.carteCompte}>
          <View style={styles.carteHeader}>
            <Text style={styles.labelCompte}>Compte principal</Text>
            <TouchableOpacity onPress={() => setSoldeVisible(!soldeVisible)}>
              <Text style={styles.iconOeil}>{soldeVisible ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.solde}>
            {soldeVisible ? formaterMontant(solde) : '•••• F'}
          </Text>

          <TouchableOpacity
            style={styles.boutonDeposer}
            onPress={() => navigation.navigate('Recharge')}
          >
            <Text style={styles.texteBoutonDeposer}>+ Deposer de l'argent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              onPress={() => gererAction(action.id)}
            >
              <View style={styles.actionIcone}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.transactionsContainer}>
          {transactions.length === 0 ? (
            <View style={styles.aucuneTransaction}>
              <Text style={styles.texteAucune}>Aucune transaction recente</Text>
            </View>
          ) : (
            transactions.map(tx => (
              <TouchableOpacity
                key={tx.id}
                style={styles.transaction}
                onPress={() => navigation.navigate('TransactionDetail', { transaction: tx })}
              >
                <View style={styles.txIconeContainer}>
                  <Text style={styles.txIcone}>{getIconeTransaction(tx.type)}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDescription}>{tx.description}</Text>
                  <Text style={styles.txDate}>{formaterDate(tx.cree_le)}</Text>
                </View>
                <View style={styles.txMontantContainer}>
                  <Text style={[styles.txMontant, { color: getCouleurMontant(tx.type) }]}>
                    {getPrefixeMontant(tx.type)}{formaterMontant(tx.montant)}
                  </Text>
                  <Text style={styles.txFleche}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {transactions.length > 0 && (
            <TouchableOpacity
              style={styles.voirTout}
              onPress={() => navigation.navigate('Historique')}
            >
              <Text style={styles.texteVoirTout}>Tout afficher</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  avatarContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F0A500',
    alignItems: 'center', justifyContent: 'center'
  },
  avatarTexte: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  bonjour: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  texteParametres: { fontSize: 22 },
  carteCompte: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 8
  },
  carteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  labelCompte: { fontSize: 14, color: '#8E8E93' },
  iconOeil: { fontSize: 18 },
  solde: { fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  boutonDeposer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  texteBoutonDeposer: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  action: { alignItems: 'center' },
  actionIcone: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center'
  },
  actionEmoji: { fontSize: 24 },
  actionLabel: { fontSize: 12, color: '#FFFFFF', marginTop: 6 },
  transactionsContainer: { paddingHorizontal: 16 },
  aucuneTransaction: { alignItems: 'center', paddingVertical: 40 },
  texteAucune: { fontSize: 15, color: '#8E8E93' },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E'
  },
  txIconeContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  txIcone: { fontSize: 18, color: '#FFFFFF' },
  txInfo: { flex: 1 },
  txDescription: { fontSize: 15, color: '#FFFFFF', marginBottom: 4 },
  txDate: { fontSize: 13, color: '#8E8E93' },
  txMontantContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txMontant: { fontSize: 15, fontWeight: '600' },
  txFleche: { fontSize: 20, color: '#3C3C3E' },
  voirTout: { alignItems: 'center', paddingVertical: 24 },
  texteVoirTout: { fontSize: 16, color: '#F0A500', fontWeight: '600' }
})
