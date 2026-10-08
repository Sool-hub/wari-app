import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator
} from 'react-native'
import { compteService } from '../services/api'

export default function HistoriqueScreen({ navigation }) {
  const [transactions, setTransactions] = useState([])
  const [chargement, setChargement] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    chargerHistorique()
  }, [])

  const chargerHistorique = async (p = 1) => {
    try {
      const response = await compteService.obtenirHistorique(p)
      const data = response.data.data
      if (p === 1) {
        setTransactions(data.transactions)
      } else {
        setTransactions(prev => [...prev, ...data.transactions])
      }
      setTotal(data.total)
      setPage(p)
    } catch (error) {
      console.log('Erreur historique:', error)
    } finally {
      setChargement(false)
    }
  }

  const getIcone = (type) => {
    if (type === 'recharge') return { emoji: '↙', couleur: '#30D158', fond: '#0D2E0D' }
    if (type === 'transfert') return { emoji: '↗', couleur: '#FF6B6B', fond: '#2E0D0D' }
    if (type === 'paiement_marchand') return { emoji: '🛒', couleur: '#F0A500', fond: '#2E1E00' }
    return { emoji: '💳', couleur: '#8E8E93', fond: '#1C1C1E' }
  }

  const formaterDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short'
    }) + ' - ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const renderTransaction = ({ item }) => {
    const icone = getIcone(item.type)
    const estEntrant = item.type === 'recharge'

    return (
      <TouchableOpacity style={styles.transaction}>
        <View style={[styles.iconeContainer, { backgroundColor: icone.fond }]}>
          <Text style={[styles.icone, { color: icone.couleur }]}>{icone.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>{formaterDate(item.cree_le)}</Text>
          {item.statut === 'echoue' && (
            <View style={styles.echec}>
              <Text style={styles.echecTexte}>⊗ Echec</Text>
            </View>
          )}
        </View>
        <View style={styles.montantContainer}>
          <Text style={[
            styles.montant,
            { color: estEntrant ? '#30D158' : '#FFFFFF' },
            item.statut === 'echoue' && styles.montantEchec
          ]}>
            {estEntrant ? '+' : '-'}{parseFloat(item.montant).toLocaleString('fr-FR')} F
          </Text>
          <Text style={styles.fleche}>›</Text>
        </View>
      </TouchableOpacity>
    )
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
        <Text style={styles.titrePage}>Historique</Text>
        <Text style={styles.total}>{total} operations</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>📭</Text>
            <Text style={styles.videTexte}>Aucune transaction</Text>
          </View>
        }
        onEndReached={() => {
          if (transactions.length < total) {
            chargerHistorique(page + 1)
          }
        }}
        onEndReachedThreshold={0.5}
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
  total: { fontSize: 14, color: '#8E8E93' },
  liste: { paddingHorizontal: 16 },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E'
  },
  iconeContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  icone: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  description: { fontSize: 15, color: '#FFFFFF', marginBottom: 4 },
  date: { fontSize: 13, color: '#8E8E93' },
  echec: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  echecTexte: { fontSize: 13, color: '#DC2626' },
  montantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  montant: { fontSize: 15, fontWeight: '600' },
  montantEchec: { textDecorationLine: 'line-through', color: '#8E8E93' },
  fleche: { fontSize: 20, color: '#3C3C3E' },
  vide: { alignItems: 'center', paddingTop: 80 },
  videEmoji: { fontSize: 50, marginBottom: 16 },
  videTexte: { fontSize: 16, color: '#8E8E93' }
})
