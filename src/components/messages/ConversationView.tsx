"use client";
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  useConversation,
  useMarkConversationAsRead,
  useSendMessage,
} from '@/hooks/api/useMessages';
import { useAuth } from '@/utils/AuthContext';
import { ApiError } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import type { ConversationMessage, InboxItem } from '@/types/api';

const DEFAULT_AVATAR = '/assets/img/profile/default-avatar.png';

interface ConversationViewProps {
  pubId: number;
  contactId: number;
  /** Item del inbox correspondiente (puede ser null si es la primera vez que se contacta). */
  inboxItem: InboxItem | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ pubId, contactId, inboxItem }) => {
  const { user } = useAuth();
  const conversationQuery = useConversation(pubId, contactId);
  const sendMutation = useSendMessage(pubId, contactId);
  const markAsReadMutation = useMarkConversationAsRead();
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedReadRef = useRef<string | null>(null);

  // Auto-scroll al fondo al cargar mensajes nuevos.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversationQuery.data?.length]);

  // Marcar como leídos los mensajes recibidos del contacto al abrir la conversación.
  // Idempotente: solo dispara una vez por par (pub, contact).
  useEffect(() => {
    const key = `${pubId}-${contactId}`;
    if (hasMarkedReadRef.current === key) return;
    if (!conversationQuery.data) return;
    const hasUnread = conversationQuery.data.some(
      (m) => m.sender_id === contactId && !m.is_read,
    );
    if (!hasUnread) {
      hasMarkedReadRef.current = key;
      return;
    }
    hasMarkedReadRef.current = key;
    markAsReadMutation.mutate({ sender_id: contactId, pub_id: pubId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubId, contactId, conversationQuery.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sendMutation.isPending) return;
    setDraft('');
    sendMutation.mutate(
      { receiver_id: contactId, pub_id: pubId, content },
      {
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje.';
          toast.error(message);
          // Si falla, devolver el draft al input para que el usuario no lo pierda.
          setDraft(content);
        },
      },
    );
  };

  const contactName = inboxItem?.contact_name ?? 'Conversación';
  const contactAvatar = inboxItem?.contact_image
    ? getBackendUrl(inboxItem.contact_image)
    : DEFAULT_AVATAR;

  return (
    <div className="conversation-view">
      <header className="conversation-header">
        <Link href={`/creator-profile/${contactId}`} className="conversation-contact">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contactAvatar}
            alt={contactName}
            width={36}
            height={36}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
          <span>
            <strong>{contactName}</strong>
            {inboxItem && <small>{inboxItem.pub_title}</small>}
          </span>
        </Link>
        <Link href={`/publications/${pubId}`} className="conversation-pub-link">
          Ver publicación →
        </Link>
      </header>

      <div className="conversation-messages">
        {conversationQuery.isLoading && (
          <div className="conversation-state">Cargando mensajes…</div>
        )}
        {conversationQuery.error && (
          <div className="conversation-state conversation-state-error">
            {conversationQuery.error instanceof ApiError
              ? conversationQuery.error.message
              : 'No se pudo cargar la conversación.'}
          </div>
        )}
        {conversationQuery.data && conversationQuery.data.length === 0 && (
          <div className="conversation-state">
            Es el inicio de tu conversación. Escribí el primer mensaje.
          </div>
        )}
        {conversationQuery.data?.map((msg) => (
          <MessageBubble key={msg.message_id} message={msg} myUserId={user?.id ?? null} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="conversation-composer" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribí un mensaje…"
          rows={2}
          onKeyDown={(e) => {
            // Enter envía, Shift+Enter inserta nueva línea.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) form.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="fill-btn conversation-send"
          disabled={sendMutation.isPending || draft.trim().length === 0}
        >
          {sendMutation.isPending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      <style jsx>{`
        .conversation-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          gap: 12px;
        }
        .conversation-contact {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--clr-common-heading, #181818);
          text-decoration: none;
        }
        .conversation-contact strong {
          display: block;
          font-size: 14px;
        }
        .conversation-contact small {
          display: block;
          font-size: 12px;
          opacity: 0.7;
        }
        .conversation-pub-link {
          font-size: 13px;
          color: var(--clr-theme-1, #6c5ce7);
          font-weight: 600;
          text-decoration: none;
          flex-shrink: 0;
        }
        .conversation-messages {
          flex: 1;
          padding: 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 300px;
          max-height: calc(100vh - 380px);
        }
        .conversation-state {
          padding: 30px 20px;
          text-align: center;
          opacity: 0.6;
          font-size: 14px;
        }
        .conversation-state-error {
          color: #ef4444;
          opacity: 1;
        }
        .conversation-composer {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-top: 1px solid rgba(128, 128, 128, 0.18);
          align-items: flex-end;
        }
        .conversation-composer textarea {
          flex: 1;
          resize: none;
          padding: 10px 14px;
          border: 1px solid var(--clr-common-border, rgba(128, 128, 128, 0.25));
          border-radius: 8px;
          background: var(--clr-bg-white, #fff);
          color: var(--clr-common-heading, #181818);
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }
        .conversation-composer textarea:focus {
          border-color: var(--clr-theme-1, #6c5ce7);
        }
        :global(.conversation-send) {
          height: 44px;
          padding: 0 22px;
          font-size: 14px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

interface MessageBubbleProps {
  message: ConversationMessage;
  myUserId: number | null;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, myUserId }) => {
  // Mensaje optimista (sender_id=0) → tratamos como propio mientras se confirma.
  const isMine = message.sender_id === myUserId || message.sender_id === 0;
  const time = new Date(message.created_at).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`bubble-row ${isMine ? 'is-mine' : ''}`}>
      <div className="bubble">
        <p>{message.content}</p>
        <span className="bubble-time">{time}</span>
      </div>
      <style jsx>{`
        .bubble-row {
          display: flex;
          justify-content: flex-start;
        }
        .bubble-row.is-mine {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(128, 128, 128, 0.12);
          color: var(--clr-common-heading, #181818);
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }
        .bubble-row.is-mine .bubble {
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
        }
        .bubble p {
          margin: 0 0 4px;
          white-space: pre-wrap;
        }
        .bubble-time {
          display: block;
          font-size: 10px;
          opacity: 0.7;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default ConversationView;
