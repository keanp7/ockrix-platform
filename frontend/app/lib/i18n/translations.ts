/**
 * Translation Strings
 * 
 * All application text strings organized by language
 */

import { SupportedLocale } from './config';

export interface Translations {
  // Common
  common: {
    continue: string;
    back: string;
    next: string;
    submit: string;
    cancel: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
  };

  // Navigation
  nav: {
    home: string;
    recovery: string;
    about: string;
  };

  // Landing Page
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    recoverAccess: string;
    howItWorks: string;
    trusted: string;
  };

  // Recovery Flow
  recovery: {
    identifyAccount: string;
    enterEmailOrPhone: string;
    emailAddress: string;
    phoneNumber: string;
    continueToVerification: string;
    aiVerification: string;
    analyzingRisk: string;
    verificationSuccessful: string;
    verificationComplete: string;
    recoveryBlocked: string;
    secureConfirmation: string;
    enterToken: string;
    confirmRecovery: string;
  };

  // Voice Recovery
  voice: {
    voiceInput: string;
    textInput: string;
    startVoiceInput: string;
    listening: string;
    speakClearly: string;
    transcript: string;
    clear: string;
    useVoice: string;
    useText: string;
    notSupported: string;
  };

  // AI Verification
  ai: {
    runningAnalysis: string;
    checkingIP: string;
    analyzingPatterns: string;
    verifyingDevice: string;
    riskScore: string;
    confidence: string;
  };

  // Errors
  errors: {
    invalidEmail: string;
    invalidPhone: string;
    required: string;
    networkError: string;
    microphoneDenied: string;
  };

  // Security
  security: {
    zeroKnowledge: string;
    privacyProtected: string;
    secure: string;
    encrypted: string;
  };
}

const translations: Record<SupportedLocale, Translations> = {
  en: {
    common: {
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      retry: 'Retry',
    },
    nav: {
      home: 'Home',
      recovery: 'Recovery',
      about: 'About',
    },
    landing: {
      heroTitle: 'Access. Recovered.',
      heroSubtitle: 'AI-powered account recovery with zero-knowledge architecture.',
      recoverAccess: 'Recover Access',
      howItWorks: 'How It Works',
      trusted: 'Zero-Knowledge • AI-Powered • Secure',
    },
    recovery: {
      identifyAccount: 'Identify Your Account',
      enterEmailOrPhone: 'Enter your email address or phone number to begin recovery',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      continueToVerification: 'Continue to Verification',
      aiVerification: 'AI Risk Verification',
      analyzingRisk: 'Analyzing recovery attempt for security risks',
      verificationSuccessful: 'Verification Successful',
      verificationComplete: 'Verification Complete',
      recoveryBlocked: 'Recovery Blocked',
      secureConfirmation: 'Secure Recovery Confirmation',
      enterToken: 'Enter the recovery token sent to your email',
      confirmRecovery: 'Confirm Recovery',
    },
    voice: {
      voiceInput: 'Voice Input',
      textInput: 'Text Input',
      startVoiceInput: 'Start Voice Input',
      listening: 'Listening...',
      speakClearly: 'Speak your email address clearly',
      transcript: 'Transcript:',
      clear: 'Clear',
      useVoice: 'Use Voice',
      useText: 'Use Text',
      notSupported: 'Voice Input Not Available',
    },
    ai: {
      runningAnalysis: 'Running Security Analysis',
      checkingIP: 'Checking IP reputation',
      analyzingPatterns: 'Analyzing request patterns',
      verifyingDevice: 'Verifying device fingerprint',
      riskScore: 'Risk Score',
      confidence: 'Confidence',
    },
    errors: {
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      required: 'This field is required',
      networkError: 'Network error. Please check your connection.',
      microphoneDenied: 'Microphone permission denied. Please enable microphone access.',
    },
    security: {
      zeroKnowledge: 'Zero-Knowledge',
      privacyProtected: 'Privacy Protected',
      secure: 'Secure',
      encrypted: 'Encrypted',
    },
  },

  es: {
    common: {
      continue: 'Continuar',
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      retry: 'Reintentar',
    },
    nav: {
      home: 'Inicio',
      recovery: 'Recuperación',
      about: 'Acerca de',
    },
    landing: {
      heroTitle: 'Acceso. Recuperado.',
      heroSubtitle: 'Recuperación de cuenta con IA y arquitectura de conocimiento cero.',
      recoverAccess: 'Recuperar Acceso',
      howItWorks: 'Cómo Funciona',
      trusted: 'Conocimiento Cero • IA • Seguro',
    },
    recovery: {
      identifyAccount: 'Identifica Tu Cuenta',
      enterEmailOrPhone: 'Ingresa tu dirección de correo o número de teléfono para comenzar la recuperación',
      emailAddress: 'Dirección de Correo',
      phoneNumber: 'Número de Teléfono',
      continueToVerification: 'Continuar a Verificación',
      aiVerification: 'Verificación de Riesgo con IA',
      analyzingRisk: 'Analizando intento de recuperación para riesgos de seguridad',
      verificationSuccessful: 'Verificación Exitosa',
      verificationComplete: 'Verificación Completa',
      recoveryBlocked: 'Recuperación Bloqueada',
      secureConfirmation: 'Confirmación Segura de Recuperación',
      enterToken: 'Ingresa el token de recuperación enviado a tu correo',
      confirmRecovery: 'Confirmar Recuperación',
    },
    voice: {
      voiceInput: 'Entrada de Voz',
      textInput: 'Entrada de Texto',
      startVoiceInput: 'Iniciar Entrada de Voz',
      listening: 'Escuchando...',
      speakClearly: 'Habla tu dirección de correo claramente',
      transcript: 'Transcripción:',
      clear: 'Limpiar',
      useVoice: 'Usar Voz',
      useText: 'Usar Texto',
      notSupported: 'Entrada de Voz No Disponible',
    },
    ai: {
      runningAnalysis: 'Ejecutando Análisis de Seguridad',
      checkingIP: 'Verificando reputación de IP',
      analyzingPatterns: 'Analizando patrones de solicitud',
      verifyingDevice: 'Verificando huella digital del dispositivo',
      riskScore: 'Puntuación de Riesgo',
      confidence: 'Confianza',
    },
    errors: {
      invalidEmail: 'Por favor ingresa una dirección de correo válida',
      invalidPhone: 'Por favor ingresa un número de teléfono válido',
      required: 'Este campo es requerido',
      networkError: 'Error de red. Por favor verifica tu conexión.',
      microphoneDenied: 'Permiso de micrófono denegado. Por favor habilita el acceso al micrófono.',
    },
    security: {
      zeroKnowledge: 'Conocimiento Cero',
      privacyProtected: 'Privacidad Protegida',
      secure: 'Seguro',
      encrypted: 'Cifrado',
    },
  },

  fr: {
    common: {
      continue: 'Continuer',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      cancel: 'Annuler',
      close: 'Fermer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      retry: 'Réessayer',
    },
    nav: {
      home: 'Accueil',
      recovery: 'Récupération',
      about: 'À propos',
    },
    landing: {
      heroTitle: 'Accès. Récupéré.',
      heroSubtitle: 'Récupération de compte alimentée par IA avec architecture à connaissance zéro.',
      recoverAccess: 'Récupérer l\'Accès',
      howItWorks: 'Comment ça Marche',
      trusted: 'Connaissance Zéro • IA • Sécurisé',
    },
    recovery: {
      identifyAccount: 'Identifier Votre Compte',
      enterEmailOrPhone: 'Entrez votre adresse e-mail ou numéro de téléphone pour commencer la récupération',
      emailAddress: 'Adresse E-mail',
      phoneNumber: 'Numéro de Téléphone',
      continueToVerification: 'Continuer vers la Vérification',
      aiVerification: 'Vérification de Risque par IA',
      analyzingRisk: 'Analyse de la tentative de récupération pour les risques de sécurité',
      verificationSuccessful: 'Vérification Réussie',
      verificationComplete: 'Vérification Terminée',
      recoveryBlocked: 'Récupération Bloquée',
      secureConfirmation: 'Confirmation Sécurisée de Récupération',
      enterToken: 'Entrez le jeton de récupération envoyé à votre e-mail',
      confirmRecovery: 'Confirmer la Récupération',
    },
    voice: {
      voiceInput: 'Saisie Vocale',
      textInput: 'Saisie Texte',
      startVoiceInput: 'Démarrer la Saisie Vocale',
      listening: 'Écoute...',
      speakClearly: 'Prononcez clairement votre adresse e-mail',
      transcript: 'Transcription:',
      clear: 'Effacer',
      useVoice: 'Utiliser la Voix',
      useText: 'Utiliser le Texte',
      notSupported: 'Saisie Vocale Non Disponible',
    },
    ai: {
      runningAnalysis: 'Exécution de l\'Analyse de Sécurité',
      checkingIP: 'Vérification de la réputation IP',
      analyzingPatterns: 'Analyse des modèles de demande',
      verifyingDevice: 'Vérification de l\'empreinte de l\'appareil',
      riskScore: 'Score de Risque',
      confidence: 'Confiance',
    },
    errors: {
      invalidEmail: 'Veuillez entrer une adresse e-mail valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      required: 'Ce champ est obligatoire',
      networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
      microphoneDenied: 'Permission du microphone refusée. Veuillez activer l\'accès au microphone.',
    },
    security: {
      zeroKnowledge: 'Connaissance Zéro',
      privacyProtected: 'Confidentialité Protégée',
      secure: 'Sécurisé',
      encrypted: 'Chiffré',
    },
  },

  ht: {
    common: {
      continue: 'Kontinye',
      back: 'Retounen',
      next: 'Pwochen',
      submit: 'Soumèt',
      cancel: 'Anile',
      close: 'Fèmen',
      loading: 'Chaje...',
      error: 'Erè',
      success: 'Siksè',
      retry: 'Eseye Ankò',
    },
    nav: {
      home: 'Kay',
      recovery: 'Rekiperasyon',
      about: 'Sou',
    },
    landing: {
      heroTitle: 'Aksè. Rkape.',
      heroSubtitle: 'Rekiperasyon kont ak entèlijans atifisyèl ak achitekti konesans zewo.',
      recoverAccess: 'Rekipe Aksè',
      howItWorks: 'Kijan Li Travay',
      trusted: 'Konesans Zewo • IA • An Sekirite',
    },
    recovery: {
      identifyAccount: 'Idantifye Kont Ou',
      enterEmailOrPhone: 'Antre adrès imèl ou oswa nimewo telefòn ou pou kòmanse rekiperasyon an',
      emailAddress: 'Adrès Imèl',
      phoneNumber: 'Nimewo Telefòn',
      continueToVerification: 'Kontinye nan Verifikasyon',
      aiVerification: 'Verifikasyon Risk ak IA',
      analyzingRisk: 'Analize tantativ rekiperasyon pou risk sekirite',
      verificationSuccessful: 'Verifikasyon Reyisi',
      verificationComplete: 'Verifikasyon Konplete',
      recoveryBlocked: 'Rekiperasyon Bloke',
      secureConfirmation: 'Konfimasyon Rekiperasyon An Sekirite',
      enterToken: 'Antre kòd rekiperasyon an voye nan imèl ou',
      confirmRecovery: 'Konfime Rekiperasyon',
    },
    voice: {
      voiceInput: 'Antre Vwa',
      textInput: 'Antre Tèks',
      startVoiceInput: 'Kòmanse Antre Vwa',
      listening: 'Ap Koute...',
      speakClearly: 'Pale adrès imèl ou klèman',
      transcript: 'Transkripsyon:',
      clear: 'Netwaye',
      useVoice: 'Itilize Vwa',
      useText: 'Itilize Tèks',
      notSupported: 'Antre Vwa Pa Disponib',
    },
    ai: {
      runningAnalysis: 'Egzekite Analiz Sekirite',
      checkingIP: 'Tcheke repitasyon IP',
      analyzingPatterns: 'Analize modèl demann',
      verifyingDevice: 'Verifye anprent aparèy la',
      riskScore: 'Nòt Risk',
      confidence: 'Konfyans',
    },
    errors: {
      invalidEmail: 'Tanpri antre yon adrès imèl valab',
      invalidPhone: 'Tanpri antre yon nimewo telefòn valab',
      required: 'Jaden sa a obligatwa',
      networkError: 'Erè rezo. Tanpri tcheke koneksyon ou.',
      microphoneDenied: 'Pèmisyon mikwofòn refize. Tanpri pèmèt aksè mikwofòn la.',
    },
    security: {
      zeroKnowledge: 'Konesans Zewo',
      privacyProtected: 'Vye Privè Pwoteje',
      secure: 'An Sekirite',
      encrypted: 'Chifre',
    },
  },
};

export function getTranslations(locale: SupportedLocale): Translations {
  return translations[locale] || translations.en;
}
