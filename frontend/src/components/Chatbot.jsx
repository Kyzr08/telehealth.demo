import { useEffect } from "react";

const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK?.trim();

export default function HealthyChat() {
  useEffect(() => {
    if (!webhookUrl) {
      return undefined;
    }

    // Cargar estilos del chat
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Aplicar paleta TeleHealth+
    const style = document.createElement("style");
    style.innerHTML = `
      :root {
        /* Colores principales */
        --chat--color-primary: #0aa6b7;
        --chat--color-primary-shade-50: #09a0af;
        --chat--color-primary-shade-100: #088c9a;
        --chat--color-secondary: #22c1c3;
        --chat--color-dark: #1e293b;
        --chat--color-light: #f0fafd;
        --chat--color-white: #ffffff;
        --chat--color-disabled: #9ca3af;

        /* Fondo y texto */
        --chat--message--bot--background: #ffffff;
        --chat--message--bot--color: #1e293b;
        --chat--message--user--background: #0aa6b7;
        --chat--message--user--color: #ffffff;

        /* Burbuja */
        --chat--toggle--background: #0aa6b7;
        --chat--toggle--hover--background: #09a0af;
        --chat--toggle--active--background: #088c9a;
        --chat--toggle--color: #ffffff;
        --chat--toggle--size: 60px;

        /* Ventana del chat */
        --chat--window--width: 400px;
        --chat--window--height: 600px;
        --chat--border-radius: 20px;
        --chat--header--background: #0aa6b7;
        --chat--header--color: #ffffff;
        
        /* Tipografía */
        --chat--message--font-size: 1rem;
        --chat--heading--font-size: 1.3rem;
      }

      #n8n-chat ul {
        list-style: disc;
        padding-left: 1.5rem;
        margin-left: 0;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      #n8n-chat ol {
        list-style: decimal;
        padding-left: 1.5rem;
        margin-left: 0;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      #n8n-chat li::marker {
        color: #0aa6b7;
      }

      @media (max-width: 768px) {
        :root {
          --chat--window--bottom: 70px; /* Ajusta la posición solo en pantallas pequeñas */
        }
      }
    `;
    document.head.appendChild(style);

    // Crear script del chat
    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

      createChat({
        webhookUrl: '${webhookUrl}',
        mode: 'window',
        target: '#n8n-chat',
        showWelcomeScreen: false,
        enableStreaming: false,
        defaultLanguage: 'es',
        initialMessages: [
          '¡Hola! Soy Healthy, tu asistente virtual de TeleHealth+.'
        ],
        i18n: {
          es: {
            title: 'Asistente TeleHealth+',
            subtitle: '',
            inputPlaceholder: 'Escribe tu mensaje...',
            getStarted: 'Nueva conversación'
          }
        },
        poweredBy: false
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
      document.body.removeChild(script);
    };
  }, []);

  return <div id="n8n-chat"></div>;
}
