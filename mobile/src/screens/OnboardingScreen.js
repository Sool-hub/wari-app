import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar
} from 'react-native'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    titre: 'Votre compte en 2 minutes',
    description: 'Creez votre compte Wari avec juste votre numero de telephone. Pas de paperasse.',
    emoji: 'rocket'
  },
  {
    id: '2',
    titre: 'Rechargez facilement',
    description: 'Alimentez votre compte depuis Orange Money ou Wave en quelques secondes.',
    emoji: 'card'
  },
  {
    id: '3',
    titre: 'Payez partout dans le monde',
    description: 'Votre carte virtuelle Wari est acceptee sur tous les sites de paiement en ligne.',
    emoji: 'world'
  }
]

export default function OnboardingScreen({ navigation }) {
  const [indexActuel, setIndexActuel] = useState(0)
  const flatListRef = useRef(null)

  const slidesSuivant = () => {
    if (indexActuel < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: indexActuel + 1 })
      setIndexActuel(indexActuel + 1)
    } else {
      navigation.replace('Connexion')
    }
  }

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>
          {item.emoji === 'rocket' ? 'rocket' : item.emoji === 'card' ? 'card' : 'world'}
        </Text>
      </View>
      <Text style={styles.titre}>{item.titre}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setIndexActuel(index)
        }}
      />
      <View style={styles.footer}>
        <View style={styles.pointsContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.point, i === indexActuel ? styles.pointActif : styles.pointInactif]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.bouton} onPress={slidesSuivant}>
          <Text style={styles.texteBouton}>
            {indexActuel === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
        {indexActuel < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Connexion')}>
            <Text style={styles.texteIgnorer}>Ignorer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 200
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(240, 165, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  emoji: { fontSize: 14, color: '#F0A500', fontWeight: 'bold' },
  titre: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 26 },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center'
  },
  pointsContainer: { flexDirection: 'row', marginBottom: 30 },
  point: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  pointActif: { backgroundColor: '#F0A500', width: 24 },
  pointInactif: { backgroundColor: 'rgba(255,255,255,0.3)' },
  bouton: {
    backgroundColor: '#F0A500',
    borderRadius: 16,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16
  },
  texteBouton: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  texteIgnorer: { fontSize: 16, color: 'rgba(255,255,255,0.5)' }
})
