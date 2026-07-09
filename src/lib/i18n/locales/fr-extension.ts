import type { LocaleOverrides } from "../from-english";

export const frExtension: LocaleOverrides = {
  friends: {
    viewProfile: "Voir le profil",
  },
  profile: {
    title: "Profil",
    memberSince: "{days} jours sur Tomris",
    memberSinceOne: "1 jour sur Tomris",
    notFound: "Utilisatrice introuvable ou profil indisponible.",
    addFriend: "Ajouter en amie",
    message: "Envoyer un message",
  },
  nav: {
    more: "Plus",
    whyUs: "Pourquoi Tomris ?",
  },
  whyUs: {
    title: "Pourquoi Tomris ?",
    subtitle:
      "Tomris n'est pas une app vide — c'est une plateforme de solidarité où les femmes sont entendues, se sentent plus en sécurité et se soutiennent vraiment.",
    sections: [
      {
        icon: "",
        title: "De vraies femmes, une vraie vérification",
        intro: "Chaque demande est examinée une par une par nos représentantes :",
        items: [
          "Nous vérifions si le selfie est généré par IA.",
          "Nous vérifions si la photo provient d'un autre compte ou d'Internet.",
          "Les profils faux ou malveillants ne sont pas approuvés.",
          "Ta photo de vérification est supprimée définitivement après examen — les admins masculins n'y ont pas accès.",
        ],
      },
      {
        icon: "",
        title: "Tolérance zéro pour les trolls et faux comptes",
        items: [
          "Les trolls, le harcèlement et les faux comptes signalés sont traités en priorité.",
          "Des bannissements permanents peuvent être appliqués sous 24 h si nécessaire ; la même adresse e-mail ne peut pas se réinscrire.",
          "Tu peux bloquer des utilisatrices et signaler des publications et messages à tout moment.",
          "Les responsables de groupe utilisent l'adhésion sur approbation pour empêcher les trolls d'entrer.",
        ],
      },
      {
        icon: "💜",
        title: "Partage tes difficultés uniquement avec des femmes",
        items: [
          "Choisis l'audience : tout le monde, membres femmes uniquement ou membres hommes uniquement.",
          "Messages privés et groupes avec des femmes vérifiées.",
          "Ton e-mail n'apparaît pas sur ton profil — la confidentialité d'abord.",
          "Les signaux d'urgence n'atteignent que les personnes de ta liste d'amies, instantanément.",
        ],
      },
      {
        icon: "",
        title: "Solidarité et groupes dans ta ville",
        intro: "Connecte-toi avec des femmes près de chez toi :",
        items: [
          "Crée ou rejoins des groupes par région, département ou ville.",
          "Discute en groupe avec des femmes de la même ville et planifie la solidarité.",
          "Organise des rencontres, événements ou entraide — la responsable décide qui rejoint.",
          "Filtre le fil par ta région pour suivre ta communauté locale.",
        ],
      },
      {
        icon: "",
        title: "Conçu pour ta tranquillité",
        items: [
          "Parcours sans vérification ; publication et messages débloqués après approbation — restriction temporaire pour ta sécurité, pas un jugement.",
          "Filtre de contenu actif à l'inscription, aux publications et aux messages.",
          "Mode sombre pour une utilisation confortable la nuit (dans Paramètres).",
          "5 langues ; noms d'utilisateur et recherche en turc pris en charge.",
        ],
      },
    ],
    verificationTitle: "Comment fonctionne la vérification ?",
    verificationItems: [
      "Inscris-toi et explore la plateforme tout de suite — pas de photo à l'inscription.",
      "Quand tu es prête, envoie un selfie sur /verification et accepte le consentement confidentialité.",
      "Une représentante vérifie : photo IA ? volée ? authentique ?",
      "Approuvé → accès complet (fil, messages, groupes, amies). Refusé → tu peux réessayer.",
    ],
    verificationCta: "Aller à la vérification",
    darkModeTitle: "Mode sombre",
    darkModeBody: "Agréable pour les yeux la nuit.",
    darkModeCta: "Aller aux paramètres",
    ctaFeed: "Aller au fil",
    ctaFriends: "Ajouter des amies",
    ctaGroups: "Parcourir les groupes",
  },
  empty: {
    postsTitle: "Pas encore de publications",
    postsAction: "Publier la première",
    postsFilteredTitle: "Aucune publication ne correspond à tes filtres",
    inboxTitle: "Pas encore de conversations",
    inboxAction: "Parcourir les groupes",
    groupsTitle: "Pas encore de groupes",
    groupsAction: "Créer un groupe",
    groupsFilteredTitle: "Aucun groupe ne correspond à tes filtres",
    friendsTitle: "Pas encore d'amies",
    friendsAction: "Trouver des amies",
    requestsTitle: "Aucune demande en attente",
    threadTitle: "Pas encore de messages",
  },
  chat: {
    requestJoinGroup: "Demander à rejoindre",
    joinRequestSent: "Ta demande d'adhésion a été envoyée à la responsable du groupe.",
    joinRequestPending: "En attente d'approbation",
    joinRequestsTitle: "Demandes d'adhésion",
    noJoinRequests: "Aucune demande en attente.",
    approveJoin: "Accepter",
    rejectJoin: "Refuser",
    kickMember: "Retirer du groupe",
    kickConfirmYes: "Oui, retirer",
    leaveGroup: "Quitter le groupe",
    leaveGroupConfirm:
      "Quitter ce groupe ? Si tu es responsable, la direction passe au membre suivant.",
    membersTitle: "Membres",
    leaderBadge: "Responsable",
    adminBadge: "Responsable",
  },
  settings: {
    chatEveryoneConfirmTitle: "Autoriser les messages de tout le monde ?",
    chatEveryoneConfirmBody:
      "Toute utilisatrice vérifiée sur la plateforme peut démarrer une conversation privée avec toi. Cela augmente le risque de harcèlement. Amies uniquement est plus sûr.",
    chatEveryoneConfirmYes: "Oui, autoriser tout le monde",
    themeTitle: "Apparence",
    themeHint: "Choisis le thème clair, sombre ou système. Enregistré sur cet appareil.",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Système",
  },
  verification: {
    introBody:
      "En tant que femmes, nous connaissons les difficultés et la fatigue que tu vis dans les espaces numériques et dans la vie réelle — nous te comprenons. Nous voulons que tu te sentes à l'aise dans cette app. C'est pourquoi nous utilisons une brève vérification photo, réalisée uniquement par nos représentantes. Cette étape n'est pas un jugement ; c'est une restriction temporaire pour ta sécurité, afin que chaque femme se sente en paix ici.",
    accessPendingIntro:
      "Nos représentantes examinent manuellement chaque demande. Ce processus n'est pas un jugement — il aide chaque femme à se sentir en sécurité ici. Ta photo est supprimée définitivement après examen.",
  },
  pwa: {
    installIosTitle: "Ajouter à l'écran d'accueil sur iPhone",
    installIosBody: "Utiliser Tomris comme une app dans Safari :",
    installIosSteps: [
      "Appuie sur Partager en bas de Safari (carré avec flèche)",
      "Fais défiler vers le bas → Sur l'écran d'accueil",
      "Appuie sur Ajouter en haut à droite",
    ],
  },
};
