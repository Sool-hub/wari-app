const logSecurite = (action, utilisateur_id, details, succes) => {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    utilisateur_id: utilisateur_id || 'anonyme',
    details,
    succes
  }
  console.log('[SECURITE]', JSON.stringify(log))
}

const middlewareLog = (req, res, next) => {
  const debut = Date.now()
  res.on('finish', () => {
    const duree = Date.now() - debut
    const log = {
      timestamp: new Date().toISOString(),
      methode: req.method,
      url: req.url,
      statut: res.statusCode,
      duree: duree + 'ms',
      ip: req.ip
    }
    if (res.statusCode >= 400) {
      console.log('[ALERTE]', JSON.stringify(log))
    }
  })
  next()
}

module.exports = { logSecurite, middlewareLog }
