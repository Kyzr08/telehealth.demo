import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Send, Smile, Sparkles, Stethoscope } from "lucide-react";

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

export default function ClinicianChat({ historial }) {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const eventSourceRef = useRef(null);
  const lastMessageIdRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const medicName = useMemo(() => {
    if (selectedConversation) return selectedConversation.contacto;
    return historial?.medico || "Selecciona una conversación";
  }, [historial?.medico, selectedConversation]);

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
            sender: msg.id_emisor === userId ? "patient" : "medic",
            name: msg.id_emisor === userId ? "Tú" : selectedConversation.contacto,
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
              const entry = {
                id: msg.id_mensaje,
                sender: msg.id_emisor === userId ? "patient" : "medic",
                name: msg.id_emisor === userId ? "Tú" : selectedConversation.contacto,
                timestamp: formatTime(msg.fecha),
                content: msg.mensaje,
                raw: msg,
              };
              next.push(entry);
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

  const handleSelectConversation = (idCita) => {
    const found = conversations.find((item) => item.id_cita === idCita);
    if (found) {
      setSelectedConversation(found);
      setMessages([]);
      lastMessageIdRef.current = 0;
    }
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !userId || !selectedConversation) return;

    const body = {
      id_cita: selectedConversation.id_cita,
      id_emisor: userId,
      id_receptor: selectedConversation.id_contacto,
      mensaje: trimmed,
    };

    try {
      setDraft("");
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
            sender: "patient",
            name: "Tú",
            timestamp: formatTime(msg.fecha),
            content: msg.mensaje,
            raw: msg,
          }]
        ));
      }
    } catch (error) {
      console.error("No se pudo enviar el mensaje", error);
      setDraft(trimmed);
    }
  };

  const isChatDisabled = !selectedConversation && !loadingConversations;

  return (
    <div className="flex h-full min-h-[38rem] flex-col rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm sm:min-h-[42rem] sm:p-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0aa6b7]/10 text-[#0aa6b7]">
            <Stethoscope size={22} />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900">{medicName}</h2>
            <p className="text-sm text-slate-500">
              Sigue en contacto con tu médico para aclarar dudas puntuales sobre tu tratamiento.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="chat-conversation" className="text-xs font-medium text-slate-500">
                Conversaciones
              </label>
              <select
                id="chat-conversation"
                disabled={loadingConversations || !conversations.length}
                value={selectedConversation?.id_cita || ""}
                onChange={(event) => handleSelectConversation(Number(event.target.value))}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 focus:border-[#0aa6b7] focus:outline-none"
              >
                <option value="" disabled>
                  {loadingConversations ? "Cargando..." : "Selecciona"}
                </option>
                {conversations.map((conversation) => (
                  <option key={conversation.id_cita} value={conversation.id_cita}>
                    {conversation.contacto}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-full bg-[#0aa6b7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078292]">
          <Sparkles size={16} /> Nueva consulta
        </button>
      </div>

      <div className="mt-5 flex-1 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 sm:mt-6 sm:p-4">
        <div className="flex h-full min-h-[22rem] flex-col gap-3 overflow-y-auto pr-1 text-sm text-slate-700 sm:min-h-[26rem]">
          {loadingMessages ? (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
              Cargando mensajes...
            </div>
          ) : !messages.length ? (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-400">
              {isChatDisabled ? "No tienes conversaciones disponibles todavía." : "Aún no hay mensajes."}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[85%] flex-col rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                  msg.sender === "patient"
                    ? "self-end bg-[#0aa6b7]/10 text-slate-800"
                    : "self-start border border-slate-100 bg-white text-slate-800"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                <div className="mt-2 flex justify-end text-[11px] text-slate-500">
                  {msg.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-h-[3.25rem] flex-1 items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#0aa6b7] focus-within:ring-2 focus-within:ring-[#0aa6b7]/25">
            <Smile size={18} className="mt-1 text-slate-400" />
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              placeholder={isChatDisabled ? "Selecciona una conversación para escribir" : "Escribe un mensaje para tu médico…"}
              disabled={isChatDisabled}
              className="h-full w-full resize-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <button type="button" className="mt-1 text-slate-400 transition hover:text-[#0aa6b7]" disabled>
              <Paperclip size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={isChatDisabled || !draft.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0aa6b7] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078292] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
}