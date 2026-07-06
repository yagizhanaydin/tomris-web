import { fromEnglish } from "./from-english";

export const de = fromEnglish({
  common: {
    loading: "Wird geladen...",
    save: "Speichern",
    cancel: "Abbrechen",
    back: "Zurück",
    logout: "Abmelden",
    or: "oder",
    error: "Ein Fehler ist aufgetreten",
    contentBlocked:
      "Dein Text enthält gewalttätige, sexistische oder rassistische Sprache. Tomris ist ein sicherer Raum.",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
  },
  brand: {
    name: "Tomris",
    tagline: "Solidaritätsplattform gegen jede Form von Gewalt an Frauen",
    footer: "Lila ist die Farbe der Solidarität.",
    solidarity: "Solidaritätsplattform für Frauen",
  },
  quote: {
    text: "Man muss glauben, dass alles, was wir auf der Erde sehen, das Werk der Frau ist.",
    author: "Mustafa Kemal Atatürk",
  },
  auth: {
    login: {
      title: "Anmelden",
      subtitle: "Melde dich bei deinem Konto an",
      email: "E-Mail",
      password: "Passwort",
      submit: "Anmelden",
      submitting: "Anmeldung läuft...",
      forgotPassword: "Passwort vergessen",
      noAccount: "Noch kein Konto?",
      register: "Registrieren",
      google: "Mit Google anmelden",
      errorInvalid: "Ungültige E-Mail oder Passwort.",
      errorUnverified: "Deine E-Mail ist noch nicht bestätigt. Prüfe dein Postfach.",
      resendVerification: "Bestätigungs-E-Mail erneut senden",
      resending: "Wird gesendet...",
    },
    forgot: {
      title: "Passwort vergessen",
      subtitle: "Ein Link zum Zurücksetzen wird an deine Gmail gesendet",
      description: "Gib die Gmail-Adresse ein, mit der du dich registriert hast.",
      submit: "Link senden",
      submitting: "Wird gesendet...",
      success: "Ein Link zum Zurücksetzen wurde gesendet an",
      backToLogin: "Zurück zur Anmeldung",
    },
  },
});
