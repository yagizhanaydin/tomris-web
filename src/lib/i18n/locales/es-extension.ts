import type { LocaleOverrides } from "../from-english";

export const esExtension: LocaleOverrides = {
  friends: {
    viewProfile: "Ver perfil",
  },
  profile: {
    title: "Perfil",
    memberSince: "{days} días en Tomris",
    memberSinceOne: "1 día en Tomris",
    notFound: "Usuaria no encontrada o perfil no disponible.",
    addFriend: "Añadir amiga",
    message: "Enviar mensaje",
  },
  nav: {
    more: "Más",
    whyUs: "¿Por qué Tomris?",
  },
  whyUs: {
    title: "¿Por qué Tomris?",
    subtitle:
      "Tomris no es una app vacía — es una plataforma de solidaridad donde las mujeres son escuchadas, se sienten más seguras y se apoyan de verdad.",
    sections: [
      {
        icon: "",
        title: "Mujeres reales, verificación real",
        intro: "Cada solicitud la revisan nuestras representantes una a una:",
        items: [
          "Comprobamos si el selfie está generado por IA.",
          "Comprobamos si la foto proviene de otra cuenta o de Internet.",
          "Los perfiles falsos o malintencionados no se aprueban.",
          "Tu foto de verificación se elimina permanentemente tras la revisión — los admins masculinos no tienen acceso.",
        ],
      },
      {
        icon: "",
        title: "Cero tolerancia con trolls y cuentas falsas",
        items: [
          "Los trolls, acoso y cuentas falsas denunciadas se revisan con prioridad.",
          "Pueden aplicarse baneos permanentes en 24 horas si hace falta; el mismo correo no puede registrarse de nuevo.",
          "Puedes bloquear usuarias y denunciar publicaciones y mensajes en cualquier momento.",
          "Las líderes de grupo usan entrada con aprobación para evitar trolls en el chat.",
        ],
      },
      {
        icon: "💜",
        title: "Comparte tus problemas solo con mujeres",
        items: [
          "Elige la audiencia: todos, solo miembros mujeres o solo miembros hombres.",
          "Mensajes directos y grupos con mujeres verificadas.",
          "Tu correo no aparece en el perfil — la privacidad primero.",
          "Las señales de emergencia llegan al instante solo a personas de tu lista de amigas.",
        ],
      },
      {
        icon: "",
        title: "Solidaridad y grupos en tu ciudad",
        intro: "Conecta con mujeres cerca de ti:",
        items: [
          "Crea o únete a grupos por provincia, distrito o ciudad.",
          "Chatea en grupos con mujeres de la misma ciudad y planifica solidaridad.",
          "Organiza encuentros, eventos o ayuda mutua — la líder decide quién entra.",
          "Filtra el feed por tu región para seguir tu comunidad local.",
        ],
      },
      {
        icon: "",
        title: "Diseñado para tu tranquilidad",
        items: [
          "Navega sin verificación; publicar y mensajes se desbloquean tras la aprobación — restricción temporal por tu seguridad, no un juicio.",
          "Filtro de contenido activo en registro, publicaciones y mensajes.",
          "Modo oscuro para uso cómodo de noche (en Ajustes).",
          "5 idiomas; nombres de usuario y búsqueda en turco compatibles.",
        ],
      },
    ],
    verificationTitle: "¿Cómo funciona la verificación?",
    verificationItems: [
      "Regístrate y explora la plataforma al instante — no hace falta foto al registrarse.",
      "Cuando estés lista, sube un selfie en /verification y acepta el consentimiento de privacidad.",
      "Una representante revisa: ¿foto IA? ¿robada? ¿auténtica?",
      "Aprobada → acceso completo (feed, mensajes, grupos, amigas). Rechazada → puedes intentarlo de nuevo.",
    ],
    verificationCta: "Ir a verificación",
    darkModeTitle: "Modo oscuro",
    darkModeBody: "Cómodo para la vista de noche.",
    darkModeCta: "Ir a ajustes",
    ctaFeed: "Ir al feed",
    ctaFriends: "Añadir amigas",
    ctaGroups: "Explorar grupos",
  },
  empty: {
    postsTitle: "Aún no hay publicaciones",
    postsAction: "Compartir la primera",
    postsFilteredTitle: "Ninguna publicación coincide con tus filtros",
    inboxTitle: "Aún no hay chats",
    inboxAction: "Explorar grupos",
    groupsTitle: "Aún no hay grupos",
    groupsAction: "Crear un grupo",
    groupsFilteredTitle: "Ningún grupo coincide con tus filtros",
    friendsTitle: "Aún no tienes amigas",
    friendsAction: "Buscar amigas",
    requestsTitle: "No hay solicitudes pendientes",
    threadTitle: "Aún no hay mensajes",
  },
  chat: {
    requestJoinGroup: "Solicitar unirse",
    joinRequestSent: "Tu solicitud de unión se envió a la líder del grupo.",
    joinRequestPending: "Esperando aprobación",
    joinRequestsTitle: "Solicitudes de unión",
    noJoinRequests: "No hay solicitudes pendientes.",
    approveJoin: "Aceptar",
    rejectJoin: "Rechazar",
    kickMember: "Eliminar del grupo",
    kickConfirmYes: "Sí, eliminar",
    leaveGroup: "Salir del grupo",
    leaveGroupConfirm:
      "¿Salir de este grupo? Si eres la líder, el liderazgo pasa al siguiente miembro.",
    membersTitle: "Miembros",
    leaderBadge: "Líder",
    adminBadge: "Líder",
  },
  settings: {
    chatEveryoneConfirmTitle: "¿Permitir mensajes de todos?",
    chatEveryoneConfirmBody:
      "Cualquier usuaria verificada en la plataforma puede iniciar un chat directo contigo. Esto aumenta el riesgo de acoso. Solo amigas es más seguro.",
    chatEveryoneConfirmYes: "Sí, permitir a todos",
    themeTitle: "Apariencia",
    themeHint: "Elige tema claro, oscuro o del sistema. Se guarda en este dispositivo.",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
  },
  verification: {
    introBody:
      "Como mujeres, conocemos las dificultades y el agotamiento que vives en espacios digitales y en la vida real — te entendemos. Queremos que te sientas cómoda en esta app. Por eso usamos una breve verificación con foto, realizada solo por nuestras representantes. Este paso no es un juicio; es una restricción temporal por tu seguridad, para que cada mujer se sienta en paz aquí.",
    accessPendingIntro:
      "Nuestras representantes revisan manualmente cada solicitud. Este proceso no es un juicio — ayuda a que cada mujer se sienta segura aquí. Tu foto se elimina permanentemente tras la revisión.",
  },
  pwa: {
    installIosTitle: "Añadir a la pantalla de inicio en iPhone",
    installIosBody: "Usar Tomris como app en Safari:",
    installIosSteps: [
      "Toca Compartir abajo en Safari (cuadrado con flecha)",
      "Desplázate abajo → Añadir a pantalla de inicio",
      "Toca Añadir arriba a la derecha",
    ],
  },
};
