import React, { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    verifierSession()
  }, [])

  const verifierSession = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken')
      const userData = await AsyncStorage.getItem('utilisateur')
      if (token && userData) {
        setUtilisateur(JSON.parse(userData))
      }
    } catch (error) {
      console.log('Erreur session:', error)
    } finally {
      setChargement(false)
    }
  }

  const connexion = async (telephone, pin) => {
    const response = await authService.connexion({ telephone, pin })
    const { accessToken, refreshToken, utilisateur: user } = response.data.data
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
    await AsyncStorage.setItem('utilisateur', JSON.stringify(user))
    setUtilisateur(user)
    return response.data
  }

  const inscription = async (data) => {
    const response = await authService.inscription(data)
    const { accessToken, refreshToken, utilisateur: user } = response.data.data
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
    await AsyncStorage.setItem('utilisateur', JSON.stringify(user))
    setUtilisateur(user)
    return response.data
  }

  const deconnexion = async () => {
    try {
      await authService.deconnexion()
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'utilisateur'])
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
