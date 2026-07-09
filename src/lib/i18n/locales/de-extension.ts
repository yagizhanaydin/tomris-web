import type { LocaleOverrides } from "../from-english";

export const deExtension: LocaleOverrides = {
  beta: {
    badge: "Geschlossene Beta",
    notice: "Tomris befindet sich im Early Access. Dein Feedback hilft uns.",
  },
  friends: {
    viewProfile: "Profil ansehen",
  },
  profile: {
    title: "Profil",
    memberSince: "{days} Tage bei Tomris",
    memberSinceOne: "1 Tag bei Tomris",
    notFound: "Nutzerin nicht gefunden oder Profil nicht verfügbar.",
    addFriend: "Freundin hinzufügen",
    message: "Nachricht senden",
  },
  nav: {
    more: "Mehr",
    whyUs: "Warum Tomris?",
  },
  whyUs: {
    title: "Warum Tomris?",
    subtitle:
      "Tomris ist keine leere App — es ist eine Solidaritätsplattform, in der Frauen gehört werden, sich sicherer fühlen und einander wirklich unterstützen.",
    sections: [
      {
        icon: "",
        title: "Echte Frauen, echte Verifizierung",
        intro: "Jede Bewerbung wird von unseren Vertreterinnen einzeln geprüft:",
        items: [
          "Wir prüfen, ob das Selfie KI-generiert ist.",
          "Wir prüfen, ob das Foto von einem anderen Konto oder aus dem Internet stammt.",
          "Fake- oder böswillige Profile werden nicht genehmigt.",
          "Dein Verifizierungsfoto wird nach der Prüfung dauerhaft gelöscht — männliche Admins haben keinen Zugriff.",
        ],
      },
      {
        icon: "",
        title: "Null Toleranz für Trolle und Fake-Konten",
        items: [
          "Gemeldete Trolle, Belästigung und Fake-Konten werden prioritär geprüft.",
          "Bei Bedarf können innerhalb von 24 Stunden dauerhafte Sperren verhängt werden; dieselbe E-Mail kann sich nicht erneut registrieren.",
          "Du kannst Nutzerinnen blockieren und Beiträge sowie Nachrichten jederzeit melden.",
          "Gruppenleiterinnen nutzen Beitritt nur mit Genehmigung, damit Trolle nicht in Gruppenchats gelangen.",
        ],
      },
      {
        icon: "💜",
        title: "Teile deine Sorgen nur mit Frauen",
        items: [
          "Wähle die Zielgruppe: alle, nur weibliche Mitglieder oder nur männliche Mitglieder.",
          "Direktnachrichten und Gruppenchats mit verifizierten Frauen.",
          "Deine E-Mail wird nicht im Profil angezeigt — Datenschutz zuerst.",
          "Notfallsignale erreichen sofort nur Personen auf deiner Freundesliste.",
        ],
      },
      {
        icon: "",
        title: "Solidarität und Gruppen in deiner Stadt",
        intro: "Verbinde dich mit Frauen in deiner Nähe:",
        items: [
          "Erstelle oder tritt Gruppen nach Bundesland, Bezirk oder Stadt bei.",
          "Chatte in Gruppen mit Frauen aus derselben Stadt und plant Solidarität.",
          "Organisiere Treffen, Events oder gegenseitige Hilfe — die Gruppenleiterin entscheidet, wer beitritt.",
          "Filtere den Feed nach deiner Region, um deine lokale Community zu verfolgen.",
        ],
      },
      {
        icon: "",
        title: "Für deine Ruhe und Sicherheit gebaut",
        items: [
          "Stöbere ohne Verifizierung; Beiträge und Nachrichten werden nach Genehmigung freigeschaltet — vorübergehende Einschränkung für deine Sicherheit, keine Bewertung.",
          "Inhaltsfilter aktiv bei Registrierung, Beiträgen und Nachrichten.",
          "Dunkler Modus für komfortable Nutzung nachts (in Einstellungen).",
          "5 Sprachen; türkische Benutzernamen und Suche werden unterstützt.",
        ],
      },
    ],
    verificationTitle: "Wie funktioniert die Verifizierung?",
    verificationItems: [
      "Registriere dich und erkunde die Plattform sofort — kein Foto bei der Anmeldung nötig.",
      "Wenn du bereit bist, lade ein Selfie unter /verification hoch und akzeptiere die Datenschutzeinwilligung.",
      "Eine Vertreterin prüft: KI-Foto? gestohlen? echt?",
      "Genehmigt → voller Zugang (Feed, Nachrichten, Gruppen, Freundinnen). Abgelehnt → du kannst es erneut versuchen.",
    ],
    verificationCta: "Zur Verifizierung",
    darkModeTitle: "Dunkler Modus",
    darkModeBody: "Schonend für die Augen nachts.",
    darkModeCta: "Zu Einstellungen",
    ctaFeed: "Zum Feed",
    ctaFriends: "Freundinnen hinzufügen",
    ctaGroups: "Gruppen durchsuchen",
  },
  empty: {
    postsTitle: "Noch keine Beiträge",
    postsAction: "Ersten Beitrag teilen",
    postsFilteredTitle: "Keine Beiträge entsprechen deinen Filtern",
    inboxTitle: "Noch keine Chats",
    inboxAction: "Gruppen durchsuchen",
    groupsTitle: "Noch keine Gruppen",
    groupsAction: "Gruppe erstellen",
    groupsFilteredTitle: "Keine Gruppen entsprechen deinen Filtern",
    friendsTitle: "Noch keine Freundinnen",
    friendsAction: "Freundinnen finden",
    requestsTitle: "Keine ausstehenden Anfragen",
    threadTitle: "Noch keine Nachrichten",
  },
  chat: {
    requestJoinGroup: "Beitrittsanfrage senden",
    joinRequestSent: "Deine Beitrittsanfrage wurde an die Gruppenleiterin gesendet.",
    joinRequestPending: "Wartet auf Genehmigung",
    joinRequestsTitle: "Beitrittsanfragen",
    noJoinRequests: "Keine ausstehenden Anfragen.",
    approveJoin: "Annehmen",
    rejectJoin: "Ablehnen",
    kickMember: "Aus Gruppe entfernen",
    kickConfirmYes: "Ja, entfernen",
    leaveGroup: "Gruppe verlassen",
    leaveGroupConfirm:
      "Diese Gruppe verlassen? Wenn du Leiterin bist, geht die Leitung an das nächste Mitglied über.",
    membersTitle: "Mitglieder",
    leaderBadge: "Leiterin",
    adminBadge: "Leiterin",
  },
  settings: {
    chatEveryoneConfirmTitle: "Nachrichten von allen erlauben?",
    chatEveryoneConfirmBody:
      "Jede verifizierte Nutzerin auf der Plattform kann einen Direktchat mit dir starten. Das erhöht das Belästigungsrisiko. Nur Freundinnen ist sicherer.",
    chatEveryoneConfirmYes: "Ja, alle erlauben",
    themeTitle: "Erscheinungsbild",
    themeHint: "Helles, dunkles oder System-Design wählen. Auf diesem Gerät gespeichert.",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "System",
  },
  verification: {
    introBody:
      "Als Frauen kennen wir die Schwierigkeiten und die Erschöpfung, die du in digitalen Räumen und im wirklichen Leben erlebst — wir verstehen dich. Wir möchten, dass du dich in dieser App wohl und sicher fühlst. Deshalb nutzen wir eine kurze Fotoverifizierung, die ausschließlich von unseren Vertreterinnen durchgeführt wird. Dieser Schritt ist keine Bewertung; er ist eine vorübergehende Einschränkung für deine Sicherheit, damit sich jede Frau hier geborgen fühlt.",
    accessPendingIntro:
      "Unsere Vertreterinnen prüfen jede Bewerbung manuell. Dieser Prozess ist keine Bewertung — er hilft jeder Frau, sich hier sicher zu fühlen. Dein Foto wird nach der Prüfung dauerhaft gelöscht.",
  },
  pwa: {
    installIosTitle: "Auf dem iPhone zum Home-Bildschirm hinzufügen",
    installIosBody: "Tomris in Safari wie eine App nutzen:",
    installIosSteps: [
      "Unten in Safari auf Teilen tippen (Quadrat mit Pfeil)",
      "Nach unten scrollen → Zum Home-Bildschirm",
      "Oben rechts auf Hinzufügen tippen",
    ],
  },
};
