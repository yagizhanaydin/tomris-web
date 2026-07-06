import { fromEnglish } from "./from-english";

export const es = fromEnglish({
  common: {
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    back: "Volver",
    logout: "Cerrar sesión",
    or: "o",
    error: "Se produjo un error",
    contentBlocked:
      "Tu texto contiene lenguaje violento, sexista o racista. Tomris es un espacio seguro.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
  },
  brand: {
    name: "Tomris",
    tagline: "Plataforma de solidaridad contra toda violencia hacia las mujeres",
    footer: "El morado es el color de la solidaridad.",
    solidarity: "Plataforma de solidaridad de mujeres",
  },
  quote: {
    text: "Hay que creer que todo lo que vemos en la faz de la tierra es obra de la mujer.",
    author: "Mustafa Kemal Atatürk",
  },
  auth: {
    login: {
      title: "Iniciar sesión",
      subtitle: "Inicia sesión en tu cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      submit: "Iniciar sesión",
      submitting: "Iniciando sesión...",
      forgotPassword: "Olvidé mi contraseña",
      noAccount: "¿No tienes cuenta?",
      register: "Registrarse",
      google: "Iniciar sesión con Google",
      errorInvalid: "Correo o contraseña incorrectos.",
      errorUnverified: "Tu correo aún no está verificado. Revisa tu bandeja de entrada.",
      resendVerification: "Reenviar correo de verificación",
      resending: "Enviando...",
    },
    forgot: {
      title: "Olvidé mi contraseña",
      subtitle: "Se enviará un enlace de restablecimiento a tu Gmail",
      description: "Introduce la dirección de Gmail con la que te registraste.",
      submit: "Enviar enlace",
      submitting: "Enviando...",
      success: "Se ha enviado un enlace de restablecimiento a",
      backToLogin: "Volver al inicio de sesión",
    },
  },
});
