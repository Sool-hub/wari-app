import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert, Clipboard
} from 'react-native'

export default function TransactionDetailScreen({ navigation, route }) {
  const { transaction } = route.params

  const estEntrant = transaction.type === 'recharge'
  const estEchec = transaction.statut === 'echoue'

  const formaterDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getTypeLabel = (type) => {
    if (type === 'recharge') return 'Recharge'
    if (type === 'transfert') return 'Transfert envoye'
    if (type === 'paiement_marchand') return 'Paiement marchand'
    if (type === 'paiement_facture') return 'Paiement facture'
    return 'Transaction'
  }

  const getOperateurLabel = (operateur) => {
    if (operateur === 'orange_money') return 'Orange Money'
    if (operateur === 'wave') return 'Wave'
    if (operateur === 'moov') return 'Moov Money'
    if (operateur === 'wari') return 'Wari'
    return operateur || 'N/A'
  }

  const copierReference = () => {
    Clipboard.setString(transaction.reference)
    Alert.alert('Copie', 'Reference copiee dans le presse-papier')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titrePage}>Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.montantSection}>
          <Text style={[
            styles.montant,
            { color: estEntrant ? '#30D158' : estEchec ? '#8E8E93' : '#FFFFFF' },
            estEchec && styles.montantBarre
          ]}>
            {estEntrant ? '+' : '-'}{parseFloat(transaction.montant).toLocaleString('fr-FR')} F
          </Text>
          <Text style={styles.description}>{transaction.description}</Text>

          {estEchec && (
            <View style={styles.badgeEchec}>
              <Text style={styles.badgeEchecTexte}>⊗ Echec</Text>
            </View>
          )}

          {!estEchec && estEntrant && (
            <View style={styles.badgeSucces}>
              <Text style={styles.badgeSuccesTexte}>✓ Recu</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.ligneDetail}>
            <Text style={styles.libelleDetail}>Date et Heure</Text>
            <Text style={styles.valeurDetail}>{formaterDate(transaction.cree_le)}</Text>
          </View>

          <View style={styles.separateur} />

          <View style={styles.ligneDetail}>
            <Text style={styles.libelleDetail}>Statut</Text>
            <Text style={[
              styles.valeurDetail,
              { color: estEchec ? '#DC2626' : '#30D158' }
            ]}>
              {estEchec ? 'Echec' : 'Effectue'}
            </Text>
          </View>

          <View style={styles.separateur} />

          <View style={styles.ligneDetail}>
            <Text style={styles.libelleDetail}>Type</Text>
            <Text style={styles.valeurDetail}>{getTypeLabel(transaction.type)}</Text>
          </View>

          <View style={styles.separateur} />

          <View style={styles.ligneDetail}>
            <Text style={styles.libelleDetail}>Operateur</Text>
            <Text style={styles.valeurDetail}>{getOperateurLabel(transaction.operateur)}</Text>
          </View>

          {transaction.frais && parseFloat(transaction.frais) > 0 && (
            <>
              <View style={styles.separateur} />
              <View style={styles.ligneDetail}>
                <Text style={styles.libelleDetail}>Frais</Text>
                <Text style={styles.valeurDetail}>
                  {parseFloat(transaction.frais).toLocaleString('fr-FR')} F
                </Text>
              </View>
            </>
          )}

          {transaction.telephone_expediteur && (
            <>
              <View style={styles.separateur} />
              <View style={styles.ligneDetail}>
                <Text style={styles.libelleDetail}>Expediteur</Text>
                <Text style={styles.valeurDetail}>+223 {transaction.telephone_expediteur}</Text>
              </View>
            </>
          )}

          {transaction.telephone_destinataire && (
            <>
              <View style={styles.separateur} />
              <View style={styles.ligneDetail}>
                <Text style={styles.libelleDetail}>Destinataire</Text>
                <Text style={styles.valeurDetail}>+223 {transaction.telephone_destinataire}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Reference</Text>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceValeur}>{transaction.reference}</Text>
            <TouchableOpacity onPress={copierReference} style={styles.boutonCopier}>
              <Text style={styles.boutonCopierTexte}>⎘</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  montantSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  montant: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12
  },
  montantBarre: {
    textDecorationLine: 'line-through',
    color: '#8E8E93'
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16
  },
  badgeSucces: {
    backgroundColor: '#0D2E0D',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16
  },
  badgeSuccesTexte: { fontSize: 14, color: '#30D158', fontWeight: '600' },
  badgeEchec: {
    backgroundColor: '#2E0D0D',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16
  },
  badgeEchecTexte: { fontSize: 14, color: '#DC2626', fontWeight: '600' },
  detailsCard: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  ligneDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  libelleDetail: { fontSize: 15, color: '#8E8E93' },
  valeurDetail: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  separateur: {
    height: 1,
    backgroundColor: '#2C2C2E'
  },
  referenceCard: {
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16
  },
  referenceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
    fontWeight: '600'
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  referenceValeur: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    flex: 1
  },
  boutonCopier: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  boutonCopierTexte: { fontSize: 18, color: '#FFFFFF' }
})
