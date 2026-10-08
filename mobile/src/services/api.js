import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'http://192.168.1.7:3000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken')
        const response = await axios.post(API_URL + '/auth/refresh', { refreshToken })
        const { accessToken } = response.data.data
        await AsyncStorage.setItem('accessToken', accessToken)
        original.headers.Authorization = 'Bearer ' + accessToken
        return api(original)
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'utilisateur'])
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  inscription: (data) => api.post('/auth/inscription', data),
  connexion: (data) => api.post('/auth/connexion', data),
  deconnexion: () => api.post('/auth/deconnexion')
}

export const compteService = {
  obtenirSolde: () => api.get('/transactions/solde'),
  obtenirHistorique: (page = 1) => api.get('/transactions/historique?page=' + page),
  recharger: (data) => api.post('/transactions/recharger', data),
  transferer: (data) => api.post('/transferts', data)
}

export const carteService = {
  creerCarte: () => api.post('/cartes/creer'),
  obtenirCarte: () => api.get('/cartes'),
  bloquerCarte: () => api.put('/cartes/bloquer'),
  debloquerCarte: () => api.put('/cartes/debloquer')
}

export const kycService = {
  initialiser: () => api.post('/kyc/initialiser'),
  statut: () => api.get('/kyc/statut')
}

export const abonnementService = {
  obtenirAbonnements: () => api.get('/abonnements'),
  ajouterAbonnement: (data) => api.post('/abonnements/ajouter', data),
  annulerAbonnement: (id) => api.put('/abonnements/annuler/' + id)
}

export default api
