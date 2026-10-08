export const COULEURS = {
  primary: '#1B4D8E',
  accent: '#F0A500',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSecondaire: '#6B7280',
  succes: '#16A34A',
  erreur: '#DC2626',
  bordure: '#E5E7EB',
  card: '#FFFFFF',
  inputBackground: '#F9FAFB'
}

export const TYPOGRAPHIE = {
  titre: { fontSize: 28, fontWeight: 'bold', color: COULEURS.text },
  sousTitre: { fontSize: 20, fontWeight: '600', color: COULEURS.text },
  corps: { fontSize: 16, color: COULEURS.text },
  petit: { fontSize: 14, color: COULEURS.textSecondaire },
  lien: { fontSize: 16, color: COULEURS.primary, fontWeight: '600' }
}

export const OMBRES = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  }
}
