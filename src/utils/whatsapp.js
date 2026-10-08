// Utilitaire pour génération des messages WhatsApp officiels GSEK

/**
 * Nettoie et formate un numéro de téléphone pour l'API WhatsApp
 * Supporte les formats sénégalais (+221, 00221, 77..., 78..., 76..., 70..., 75...)
 * et internationaux.
 */
export function formatPhoneNumberForWhatsApp(phone) {
  if (!phone) return null;
  // Nettoyer tous les espaces, tirets, points et parenthèses
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Format local sénégalais : 9 chiffres débutant par 7 (ex: 771234567)
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
    cleaned = '221' + cleaned;
  }

  return cleaned.length >= 8 ? cleaned : null;
}

/**
 * Génère le lien WhatsApp avec message de relance pour impayé de scolarité
 */
export function getWhatsAppRelanceImpayeLink({
  parentTel,
  parentNom,
  eleveNom,
  classe,
  mois = 'en cours',
  montant = 0,
  ecoleNom = "Groupe Scolaire d'Excellence Sidy Konaté"
}) {
  const cleanPhone = formatPhoneNumberForWhatsApp(parentTel);
  const formattedMontant = Number(montant).toLocaleString('fr-FR');

  const greeting = parentNom ? `Bonjour M./Mme ${parentNom}` : 'Bonjour Cher Parent';

  const message =
`🏛️ *${ecoleNom}*
Rappel de Scolarité

${greeting},

Nous vous informons aimablement que la mensualité du mois de *${mois}* pour votre enfant *${eleveNom}* (Classe : *${classe}*) est en attente de règlement à la caisse de l'établissement.

• Montant à régler : *${formattedMontant} FCFA*

Merci de bien vouloir vous rapprocher de la comptabilité pour régulariser sa situation.

_Ce message est une notification automatique de l'administration scolaire._`;

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    url,
    cleanPhone,
    hasValidPhone: Boolean(cleanPhone),
    message
  };
}

/**
 * Génère le lien WhatsApp pour alerte d'absence / retard
 */
export function getWhatsAppAlerteAbsenceLink({
  parentTel,
  parentNom,
  eleveNom,
  classe,
  date,
  type = 'injustifiee', // 'injustifiee' | 'retard'
  motif,
  ecoleNom = "Groupe Scolaire d'Excellence Sidy Konaté"
}) {
  const cleanPhone = formatPhoneNumberForWhatsApp(parentTel);
  const greeting = parentNom ? `Bonjour M./Mme ${parentNom}` : 'Bonjour Cher Parent';
  const typeLabel = type === 'retard' ? 'un RETARD' : 'une ABSENCE NON JUSTIFIÉE';

  const message =
`🔔 *${ecoleNom}*
Vie Scolaire & Assiduité

${greeting},

Nous vous signalons que votre enfant *${eleveNom}* (${classe}) a été enregistré(e) pour *${typeLabel}* le *${date}*.
${motif ? `• Motif relevé : ${motif}\n` : ''}
Merci de prendre contact avec la vie scolaire pour régulariser ou justifier cette situation.

_Administration ${ecoleNom}_`;

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    url,
    cleanPhone,
    hasValidPhone: Boolean(cleanPhone),
    message
  };
}

/**
 * Génère le lien WhatsApp pour confirmation de reçu de paiement
 */
export function getWhatsAppRecuLink({
  parentTel,
  parentNom,
  eleveNom,
  classe,
  ref,
  montant,
  mois,
  ecoleNom = "Groupe Scolaire d'Excellence Sidy Konaté"
}) {
  const cleanPhone = formatPhoneNumberForWhatsApp(parentTel);
  const greeting = parentNom ? `Bonjour M./Mme ${parentNom}` : 'Bonjour Cher Parent';
  const formattedMontant = Number(montant).toLocaleString('fr-FR');

  const message =
`✅ *${ecoleNom}*
Reçu d'Encaissement Officiel

${greeting},

Nous accusons bonne réception du règlement de scolarité pour *${eleveNom}* (${classe}).

• N° Reçu : *${ref}*
• Période : *${mois || 'Scolarité'}*
• Montant réglé : *${formattedMontant} FCFA*
• Statut : *Payé / Validé en caisse*

Le reçu officiel est archivé et disponible auprès du secrétariat. Merci de votre confiance !`;

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    url,
    cleanPhone,
    hasValidPhone: Boolean(cleanPhone),
    message
  };
}
