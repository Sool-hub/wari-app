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
        const user = JSON.parse(userData)
        if (user.kyc_verifie) {
          setUtilisateur(user)
        }
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
    if (user.kyc_verifie) {
      setUtilisateur(user)
    }
    return response.data
  }

  const inscription = async (data) => {
    const response = await authService.inscription(data)
    const { accessToken, refreshToken, utilisateur: user } = response.data.data
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
    await AsyncStorage.setItem('utilisateur', JSON.stringify(user))
    return response.data
  }

  const activerCompte = async () => {
    const userData = await AsyncStorage.getItem('utilisateur')
    if (userData) {
      const user = JSON.parse(userData)
      user.kyc_verifie = true
      await AsyncStorage.setItem('utilisateur', JSON.stringify(user))
      setUtilisateur(user)
    }
  }

  const deconnexion = async () => {
    try {
      await authService.deconnexion()
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'utilisateur'])
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, inscription, deconnexion, activerCompte }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
