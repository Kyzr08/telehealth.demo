import { useEffect, useMemo, useRef, useState } from "react";
import { FaPaperPlane, FaUserFriends, FaChevronDown, FaChevronUp } from "react-icons/fa";

const CHAT_API = "http://localhost/telehealth/backend/api/chat/mensajes.php";

function formatTime(value) {
  if (!value) return "";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function MensajesMedic() {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const eventSourceRef = useRef(null);
  const lastMessageIdRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const pacienteActivo = useMemo(() => selectedConversation?.contacto || "Selecciona un paciente", [selectedConversation]);

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("usuario") || "null");
    if (sessionUser?.id_usuario) {
      setUserId(Number(sessionUser.id_usuario));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const abortController = new AbortController();
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const response = await fetch(
          `${CHAT_API}?accion=conversaciones&id_usuario=${userId}`,
          { signal: abortController.signal }
        );
        const data = await response.json();
        if (data.success) {
          setConversations(data.conversaciones || []);
          if (!selectedConversation && data.conversaciones?.length) {
            setSelectedConversation(data.conversaciones[0]);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("No se pudieron cargar las conversaciones", error);
        }
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
    return () => abortController.abort();
  }, [userId, selectedConversation]);

  useEffect(() => {
    if (!userId || !selectedConversation) return;

    const controller = new AbortController();

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await fetch(
          `${CHAT_API}?accion=mensajes&id_usuario=${userId}&id_cita=${selectedConversation.id_cita}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (data.success) {
          const mapped = (data.mensajes || []).map((msg) => ({
            id: msg.id_mensaje,
            sender: msg.id_emisor === userId ? "medico" : "paciente",
            timestamp: formatTime(msg.fecha),
            content: msg.mensaje,
            raw: msg,
          }));
          setMessages(mapped);
          const last = mapped[mapped.length - 1];
          lastMessageIdRef.current = last ? last.id : 0;
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("No se pudieron cargar los mensajes", error);
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => controller.abort();
  }, [userId, selectedConversation]);

  useEffect(() => {
    if (!userId || !selectedConversation) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const clearReconnectTimeout = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const connectStream = () => {
      if (!userId || !selectedConversation) return;

      const source = new EventSource(
        `${CHAT_API}?accion=stream&id_usuario=${userId}&id_cita=${selectedConversation.id_cita}&ultimo_id=${lastMessageIdRef.current}`
      );

      source.addEventListener("mensaje", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (!payload?.mensajes?.length) return;

          setMessages((prev) => {
            const next = [...prev];
            payload.mensajes.forEach((msg) => {
              const exists = next.some((item) => item.id === msg.id_mensaje);
              if (exists) return;
              next.push({
                id: msg.id_mensaje,
                sender: msg.id_emisor === userId ? "medico" : "paciente",
                timestamp: formatTime(msg.fecha),
                content: msg.mensaje,
                raw: msg,
              });
            });
            next.sort((a, b) => a.id - b.id);
            return next;
          });

          if (payload.ultimo_id) {
            lastMessageIdRef.current = payload.ultimo_id;
          }
        } catch (error) {
          console.error("Error procesando mensajes entrantes", error);
        }
      });

      source.addEventListener("ping", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.ultimo_id) {
            lastMessageIdRef.current = payload.ultimo_id;
          }
        } catch (error) {
          // ignorar
        }
      });

      source.onerror = () => {
        source.close();
        eventSourceRef.current = null;
        clearReconnectTimeout();
        reconnectTimeoutRef.current = setTimeout(() => {
          connectStream();
        }, 1500);
      };

      eventSourceRef.current = source;
    };

    connectStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      clearReconnectTimeout();
    };
  }, [userId, selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    lastMessageIdRef.current = 0;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !userId || !selectedConversation) return;

    const body = {
      id_cita: selectedConversation.id_cita,
      id_emisor: userId,
      id_receptor: selectedConversation.id_contacto,
      mensaje: trimmed,
    };

    try {
      setInput("");
      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success && data.mensaje) {
        const msg = data.mensaje;
        lastMessageIdRef.current = msg.id_mensaje;
        setMessages((prev) => (
          [...prev, {
            id: msg.id_mensaje,
            sender: "medico",
            timestamp: formatTime(msg.fecha),
            content: msg.mensaje,
            raw: msg,
          }]
        ));
      }
    } catch (error) {
      console.error("No se pudo enviar el mensaje", error);
      setInput(trimmed);
    }
  };

  const isChatDisabled = !selectedConversation && !loadingConversations;

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-4">
      {/* Botón desplegable para móvil */}
      <div className="md:hidden mb-2">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="w-full bg-white border border-gray-300/50 rounded-2xl p-3 flex justify-between items-center shadow-md"
          disabled={loadingConversations || !conversations.length}
        >
          <span className="font-medium text-[#0aa6b7] flex items-center gap-2">
            <FaUserFriends /> {pacienteActivo}
          </span>
          {menuAbierto ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {menuAbierto && (
          <div className="bg-white mt-2 rounded-2xl shadow-md border border-gray-300/50 flex flex-col gap-2 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id_cita}
                onClick={() => {
                  handleSelectConversation(conversation);
                  setMenuAbierto(false);
                }}
                className={`flex items-center gap-3 p-2 rounded-lg text-left transition w-full ${
                  selectedConversation?.id_cita === conversation.id_cita ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0aa6b7]/10 text-[#0aa6b7] font-semibold">
                  {conversation.contacto?.[0] || "?"}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[#0aa6b7]">{conversation.contacto}</span>
                  <span className="text-xs text-slate-400 line-clamp-1">{conversation.ultimo_mensaje || "Sin mensajes"}</span>
                </div>
              </button>
            ))}
            {!conversations.length && !loadingConversations && (
              <span className="text-xs text-slate-400 text-center py-2">Sin conversaciones disponibles.</span>
            )}
          </div>
        )}
      </div>

      {/* Lista de pacientes escritorio */}
      <div className="hidden md:flex flex-col bg-white rounded-2xl shadow-md md:w-1/3 p-4 border border-gray-300/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#120F43]">Pacientes</h2>
          {loadingConversations && <span className="text-xs text-slate-400">Cargando...</span>}
        </div>
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id_cita}
              onClick={() => handleSelectConversation(conversation)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition w-full border border-transparent ${
                selectedConversation?.id_cita === conversation.id_cita
                  ? "bg-[#0aa6b7]/10 border-[#0aa6b7]/30"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#0aa6b7]/10 text-[#0aa6b7] font-semibold">
                {conversation.contacto?.[0] || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#0aa6b7] truncate">{conversation.contacto}</p>
                <p className="text-xs text-slate-400 truncate">{conversation.ultimo_mensaje || "Sin mensajes"}</p>
              </div>
            </button>
          ))}
          {!conversations.length && !loadingConversations && (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              No tienes conversaciones activas aún.
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="bg-white rounded-2xl shadow-md flex-1 flex flex-col border border-gray-300/50">
        <div className="border-b p-3">
          <h2 className="text-lg font-semibold text-[#0aa6b7]">Chat con {pacienteActivo}</h2>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {loadingMessages ? (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
              Cargando mensajes...
            </div>
          ) : !messages.length ? (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-400">
              {isChatDisabled ? "Selecciona un paciente para iniciar." : "Aún no hay mensajes."}
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "medico" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-xl ${
                    m.sender === "medico"
                      ? "bg-[#0aa6b7] text-white rounded-br-none"
                      : "bg-white text-[#120F43] border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{m.content}</p>
                  <span className="block mt-1 text-[10px] text-white/80">
                    {m.sender === "medico" ? "Tú" : "Paciente"} · {m.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex items-center gap-3">
          <input
            type="text"
            placeholder={isChatDisabled ? "Selecciona un paciente" : "Escribe un mensaje..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatDisabled}
            className="flex-1 border rounded-lg p-2 focus:outline-[#0aa6b7] disabled:bg-gray-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isChatDisabled || !input.trim()}
            className="bg-[#0aa6b7] text-white p-2 rounded-lg hover:bg-[#0996a6] transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}