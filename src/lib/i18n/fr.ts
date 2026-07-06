import { fromEnglish } from "./from-english";

export const fr = fromEnglish({
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    back: "Retour",
    logout: "Déconnexion",
    or: "ou",
    error: "Une erreur s'est produite",
    contentBlocked:
      "Votre texte contient un langage violent, sexiste ou raciste. Tomris est un espace sûr.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  brand: {
    name: "Tomris",
    tagline: "Plateforme de solidarité contre toute violence faite aux femmes",
    footer: "Le violet est la couleur de la solidarité.",
    solidarity: "Plateforme de solidarité des femmes",
  },
  quote: {
    text: "Il faut croire que tout ce que nous voyons sur la terre est l'œuvre de la femme.",
    author: "Mustafa Kemal Atatürk",
  },
  auth: {
    login: {
      title: "Connexion",
      subtitle: "Connectez-vous à votre compte",
      email: "E-mail",
      password: "Mot de passe",
      submit: "Se connecter",
      submitting: "Connexion...",
      forgotPassword: "Mot de passe oublié",
      noAccount: "Pas encore de compte ?",
      register: "S'inscrire",
      google: "Se connecter avec Google",
      errorInvalid: "E-mail ou mot de passe invalide.",
      errorUnverified: "Votre e-mail n'est pas encore vérifié. Vérifiez votre boîte de réception.",
      resendVerification: "Renvoyer l'e-mail de vérification",
      resending: "Envoi...",
    },
    forgot: {
      title: "Mot de passe oublié",
      subtitle: "Un lien de réinitialisation sera envoyé à votre Gmail",
      description: "Entrez l'adresse Gmail utilisée lors de l'inscription.",
      submit: "Envoyer le lien",
      submitting: "Envoi...",
      success: "Un lien de réinitialisation a été envoyé à",
      backToLogin: "Retour à la connexion",
    },
  },
});
