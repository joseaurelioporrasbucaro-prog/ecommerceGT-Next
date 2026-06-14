"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  useConversation,
  useMarkConversationAsRead,
  useReactToMessage,
  useReportMessage,
  useSendMessage,
} from '@/hooks/api/useMessages';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { getPublicationImagePath } from '@/components/publications/publicationUtils';
import { useAuth } from '@/utils/AuthContext';
import { ApiError } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import { useDateFmt } from '@/utils/datetime';
import type {
  ConversationMessage,
  MessageReportReason,
} from '@/types/api';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const CONVERSATION_STARTER_KEYS = ['available', 'visit', 'offer', 'includes'] as const;
const REPORT_REASONS: MessageReportReason[] = ['spam', 'ofensivo', 'estafa', 'otro'];

interface InboxItemLite {
  contact_name: string;
  contact_image: string | null;
  pub_title: string;
}

interface ConversationViewProps {
  pubId: number;
  contactId: number;
  inboxItem: InboxItemLite | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ pubId, contactId, inboxItem }) => {
  const t = useTranslations('messages');
  const { user } = useAuth();
  const conversationQuery = useConversation(pubId, contactId);
  const sendMutation = useSendMessage(pubId, contactId);
  const reactMutation = useReactToMessage(pubId, contactId);
  const reportMutation = useReportMessage();
  const markAsReadMutation = useMarkConversationAsRead();

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ConversationMessage | null>(null);
  const [reportTarget, setReportTarget] = useState<ConversationMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMarkedReadRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversationQuery.data?.length]);

  useEffect(() => {
    const key = `${pubId}-${contactId}`;
    if (hasMarkedReadRef.current === key) return;
    if (!conversationQuery.data) return;
    const hasUnread = conversationQuery.data.some(
      (m: ConversationMessage) => m.sender_id === contactId && !m.is_read,
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
    const replyId = replyTo?.message_id ?? null;
    setReplyTo(null);
    sendMutation.mutate(
      { receiver_id: contactId, pub_id: pubId, content, reply_to_message_id: replyId },
      {
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : t('conversation.sendError');
          toast.error(message);
          setDraft(content);
          if (replyId && replyTo) setReplyTo(replyTo);
        },
      },
    );
  };

  const handleReact = (messageId: number, emoji: string) => {
    reactMutation.mutate({ messageId, emoji });
  };

  const handleReply = (message: ConversationMessage) => {
    setReplyTo(message);
    composerRef.current?.focus();
  };

  const handleReportSubmit = (reason: MessageReportReason, detail: string) => {
    if (!reportTarget) return;
    reportMutation.mutate(
      { messageId: reportTarget.message_id, reason, detail: detail || undefined },
      {
        onSuccess: () => {
          toast.success(t('report.success'));
          setReportTarget(null);
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : t('report.error');
          toast.error(message);
        },
      },
    );
  };

  const contactName = inboxItem?.contact_name ?? t('conversation.defaultTitle');
  const contactAvatar = inboxItem?.contact_image
    ? getBackendUrl(inboxItem.contact_image)
    : generateInitialsAvatar(contactName, 80);

  // Handoff #11 §6/§7 — contexto de propiedad con datos REALES. En vez de
  // depender de un payload `property` nuevo en el inbox (backend), resolvemos
  // el detalle de la publicación abierta: 1 conversación = 1 fetch, cacheado
  // por React Query (mismo queryKey que ya usa MessagesMain). Si falta imagen
  // o precio caemos al placeholder navy; el visor 3D solo aparece si hay GLB.
  const propertyQuery = usePublicationDetail(pubId);
  const pub = propertyQuery.data;
  const propTitle = pub?.pub_title ?? inboxItem?.pub_title ?? t('property.fallbackTitle');
  const propThumb = useMemo(() => {
    const first = pub?.images?.[0];
    if (!first) return null;
    const path = getPublicationImagePath(first);
    return path ? getBackendUrl(path) : null;
  }, [pub]);
  const propHasGlb = (pub?.imagesglb?.length ?? 0) > 0;
  const propPrice = useMemo(() => {
    if (pub?.pubdet_price == null) return '';
    const n = Number(pub.pubdet_price);
    if (!Number.isFinite(n)) return '';
    const sym = pub.pubdet_currency === 'USD' ? 'US$' : 'Q';
    return `${sym} ${n.toLocaleString('es-GT')}`;
  }, [pub]);
  const propZone = pub?.pub_address?.trim() || '';
  const propSub = [propPrice, propZone].filter(Boolean).join(' · ') || t('property.eyebrow');

  return (
    <div className="conversation-view">
      <header className="conversation-header">
        <Link href={`/creator-profile/${contactId}`} className="conversation-contact">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contactAvatar}
            alt={contactName}
            width={40}
            height={40}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: '14px',
              flexShrink: 0,
            }}
          />
          <span className="conversation-contact-name">
            <strong>{contactName}</strong>
          </span>
        </Link>
      </header>

      {/* Handoff #11 §6/§7 — barra de contexto: datos reales del detalle (thumb,
          título, precio · zona) con fallback al placeholder navy; el botón
          'Modelo 3D' solo aparece si la publicación tiene modelo (hasGlb). */}
      <div className="conversation-property">
        {propThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={propThumb} alt={propTitle} className="cp-thumb cp-thumb-img" />
        ) : (
          <span className="cp-thumb" aria-hidden="true"><i className="fal fa-camera" /></span>
        )}
        <div className="cp-info">
          <span className="cp-title">{propTitle}</span>
          <span className="cp-sub">{propSub}</span>
        </div>
        <Link
          href={`/publications/${pubId}`}
          className="cp-btn cp-btn-outline"
          title={t('property.view')}
        >
          <i className="fal fa-home" />
          <span>{t('property.view')}</span>
        </Link>
        {propHasGlb && (
          <Link
            href={`/publications/${pubId}/viewer`}
            className="cp-btn cp-btn-3d"
            title={t('property.model3d')}
          >
            <i className="fal fa-cube" />
            <span>{t('property.model3d')}</span>
          </Link>
        )}
      </div>

      <div className="conversation-messages">
        {conversationQuery.isLoading && (
          <div className="conversation-state">{t('conversation.loading')}</div>
        )}
        {conversationQuery.error && (
          <div className="conversation-state conversation-state-error">
            {conversationQuery.error instanceof ApiError
              ? conversationQuery.error.message
              : t('conversation.loadError')}
          </div>
        )}
        {conversationQuery.data && conversationQuery.data.length === 0 && (
          <div className="conversation-empty">
            <div className="conversation-empty-icon"><i className="fas fa-comments" /></div>
            <p className="conversation-empty-title">
              {inboxItem?.contact_name
                ? t('conversation.emptyTitleWithName', { name: inboxItem.contact_name })
                : t('conversation.emptyTitle')}
            </p>
            <p className="conversation-empty-subtitle">{t('conversation.emptySubtitle')}</p>
            <div className="conversation-starters">
              {CONVERSATION_STARTER_KEYS.map((key) => {
                const starter = t(`conversation.starters.${key}`);
                return (
                <button
                  key={key}
                  type="button"
                  className="conversation-starter"
                  onClick={() => setDraft(starter)}
                >
                  {starter}
                </button>
                );
              })}
            </div>
          </div>
        )}
        {conversationQuery.data?.map((msg: ConversationMessage) => (
          <MessageBubble
            key={msg.message_id}
            message={msg}
            myUserId={user?.id ?? null}
            onReact={handleReact}
            onReply={handleReply}
            onReport={(m) => setReportTarget(m)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de "respondiendo a..." */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <span className="reply-preview-label">
              {t('conversation.replyingTo', {
                name: replyTo.reply_to_sender_name ?? replyTo.sender_name ?? t('bubble.messageFallback'),
              })}
            </span>
            <span className="reply-preview-text">{replyTo.content}</span>
          </div>
          <button
            type="button"
            className="reply-preview-close"
            onClick={() => setReplyTo(null)}
            aria-label={t('conversation.cancelReply')}
          >
            <i className="fal fa-times" />
          </button>
        </div>
      )}

      <form className="conversation-composer" onSubmit={handleSubmit}>
        <textarea
          ref={composerRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('conversation.placeholder')}
          rows={2}
          onKeyDown={(e) => {
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
          title={sendMutation.isPending ? t('conversation.sending') : t('conversation.send')}
          aria-label={sendMutation.isPending ? t('conversation.sending') : t('conversation.send')}
        >
          {/* Handoff #5 §3 — send circular con ícono (el label vive en title/aria). */}
          <i className={sendMutation.isPending ? 'fas fa-circle-notch fa-spin' : 'fas fa-paper-plane'} />
        </button>
      </form>

      {/* Modal de reporte */}
      {reportTarget && (
        <ReportModal
          message={reportTarget}
          onCancel={() => setReportTarget(null)}
          onSubmit={handleReportSubmit}
          isSubmitting={reportMutation.isPending}
        />
      )}

      <style jsx>{`
        .conversation-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .conversation-header {
          display: flex;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          gap: 14px;
          background: var(--surface);
        }
        .conversation-contact {
          display: flex;
          align-items: center;
          color: var(--fg-strong);
          text-decoration: none;
        }
        .conversation-contact strong {
          display: block;
          font-size: 15px;
          font-weight: 700;
        }
        .conversation-messages {
          flex: 1;
          padding: 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 0;
        }
        .conversation-state {
          padding: 30px 20px;
          text-align: center;
          opacity: 0.6;
          font-size: 14px;
        }
        .conversation-state-error {
          color: var(--danger);
          opacity: 1;
        }

        /* Fase 10.4: estado vacío + sugerencias de inicio */
        .conversation-empty {
          padding: 40px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .conversation-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--info);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 4px;
        }
        .conversation-empty-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        .conversation-empty-subtitle {
          font-size: 13px;
          opacity: 0.7;
          margin: 0 0 4px;
        }
        .conversation-starters {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 420px;
          align-items: stretch;
        }
        .conversation-starter {
          background: var(--accent-soft);
          border: 1px solid var(--accent);
          color: inherit;
          border-radius: 22px;
          padding: 10px 18px;
          font-size: 13.5px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .conversation-starter:hover {
          background: var(--accent-soft);
          transform: translateY(-1px);
        }

        /* Reply preview */
        .reply-preview {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 16px;
          background: var(--accent-soft);
          border-top: 1px solid var(--border);
          border-left: 3px solid var(--info);
        }
        .reply-preview-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .reply-preview-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--info);
        }
        .reply-preview-text {
          font-size: 13px;
          opacity: 0.75;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .reply-preview-close {
          border: none;
          background: transparent;
          color: var(--fg-strong);
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
        }
        .reply-preview-close:hover {
          opacity: 1;
          background: var(--surface-sunk);
        }

        .conversation-composer {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          align-items: flex-end;
        }
        .conversation-composer textarea {
          flex: 1;
          resize: none;
          padding: 11px 18px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          border-radius: 22px;
          background: var(--surface);
          color: var(--fg-strong);
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }
        .conversation-composer textarea:focus {
          border-color: var(--accent, #b5acef);
          box-shadow: var(--shadow-focus, 0 0 0 3px rgba(181, 172, 239, 0.55));
        }
        :global(.conversation-send) {
          width: 46px;
          height: 46px;
          padding: 0;
          border-radius: 999px;
          font-size: 16px;
          flex-shrink: 0;
          /* Handoff #10 — send verde de marca (reemplaza el degradado de .fill-btn). */
          background: var(--green-500);
          color: var(--navy-900);
          border: none;
          box-shadow: var(--shadow-sm);
        }
        :global(.conversation-send:hover:not(:disabled)) {
          background: var(--green-600);
        }
        :global(.conversation-send:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Barra de contexto de propiedad (Handoff #10 §3) ── */
        .conversation-property {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
          background: var(--accent-soft);
          flex-shrink: 0;
        }
        .cp-thumb {
          width: 52px;
          height: 40px;
          border-radius: var(--r-sm, 8px);
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--navy-700), var(--navy-900));
          color: rgba(255, 255, 255, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .cp-thumb-img {
          object-fit: cover;
          background: var(--surface-sunk);
        }
        .cp-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .cp-sub {
          font-size: 12px;
          color: var(--fg-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cp-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--fg-strong);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        /* Botones van sobre <Link> → :global scopeado al padre (AGENTS §6.5). */
        .conversation-property :global(.cp-btn) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .conversation-property :global(.cp-btn-outline) {
          border: 1.5px solid var(--border-strong);
          background: var(--surface);
          color: var(--fg-strong);
        }
        .conversation-property :global(.cp-btn-outline:hover) {
          border-color: var(--accent);
          color: var(--info);
        }
        .conversation-property :global(.cp-btn-3d) {
          border: none;
          background: var(--accent);
          color: var(--navy-900);
        }
        .conversation-property :global(.cp-btn-3d:hover) {
          background: var(--accent-hover);
          color: var(--cream);
        }
        /* Móvil estrecho: botones a solo ícono para no desbordar. */
        @media (max-width: 560px) {
          .conversation-property :global(.cp-btn span) {
            display: none;
          }
          .conversation-property :global(.cp-btn) {
            padding: 8px 11px;
          }
        }
      `}</style>
    </div>
  );
};

/* ─── Bubble individual ─── */

interface MessageBubbleProps {
  message: ConversationMessage;
  myUserId: number | null;
  onReact: (messageId: number, emoji: string) => void;
  onReply: (message: ConversationMessage) => void;
  onReport: (message: ConversationMessage) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  myUserId,
  onReact,
  onReply,
  onReport,
}) => {
  const t = useTranslations('messages');
  const dateFmt = useDateFmt();
  const isMine =
    Number(message.sender_id) === Number(myUserId) || Number(message.sender_id) === 0;
  const time = dateFmt.time(message.created_at, '');

  const [showReactions, setShowReactions] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Cerrar picker al click fuera.
  useEffect(() => {
    if (!showReactions) return;
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showReactions]);

  const handlePickReaction = (emoji: string) => {
    onReact(message.message_id, emoji);
    setShowReactions(false);
  };

  const hasReactions = (message.reactions?.length ?? 0) > 0;
  const isOptimistic = message.message_id < 0;

  return (
    <div className={`bubble-row${isMine ? ' is-mine' : ''}`}>
      <div className={`bubble-stack${showReactions ? ' picker-open' : ''}`}>
        {/* Snippet de reply, si aplica */}
        {message.reply_to_message_id && message.reply_to_content && (
          <div className="reply-snippet">
            <span className="reply-snippet-author">
              {message.reply_to_sender_name ?? t('bubble.messageFallback')}
            </span>
            <span className="reply-snippet-text">{message.reply_to_content}</span>
          </div>
        )}

        <div className="bubble-flex">
          <div className="bubble" title={time}>
            <p>{message.content}</p>
          </div>

          {/* Acciones — solo visibles si no es optimistic */}
          {!isOptimistic && (
            <div className="bubble-actions">
              <span className="bubble-time">{time}</span>
              <div className="bubble-action-buttons">
                <button
                  type="button"
                  className="bubble-action"
                  title={t('bubble.react')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactions((v) => !v);
                  }}
                >
                  <i className="fal fa-smile" />
                </button>
                <button
                  type="button"
                  className="bubble-action"
                  title={t('bubble.reply')}
                  onClick={() => onReply(message)}
                >
                  <i className="fal fa-reply" />
                </button>
                {!isMine && (
                  <button
                    type="button"
                    className="bubble-action"
                    title={t('bubble.report')}
                    onClick={() => onReport(message)}
                  >
                    <i className="fal fa-flag" />
                  </button>
                )}
              </div>

              {showReactions && (
                <div className="reaction-picker" ref={pickerRef}>
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="reaction-emoji"
                      onClick={() => handlePickReaction(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pill con las reacciones agregadas */}
        {hasReactions && (
          <div className="reactions-summary">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                className={`reaction-chip${r.mine ? ' is-mine-reaction' : ''}`}
                onClick={() => onReact(message.message_id, r.emoji)}
                title={r.mine ? t('bubble.removeReaction') : t('bubble.sameReaction')}
              >
                <span className="reaction-chip-emoji">{r.emoji}</span>
                <span className="reaction-chip-count">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .bubble-row {
          display: flex;
          width: 100%;
          justify-content: flex-start;
        }
        .bubble-row.is-mine {
          justify-content: flex-end;
        }

        .bubble-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 75%;
          position: relative;
        }
        .bubble-row.is-mine .bubble-stack {
          align-items: flex-end;
        }

        .bubble-flex {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }
        .bubble-row.is-mine .bubble-flex {
          flex-direction: row-reverse;
        }

        /* Burbuja */
        .bubble {
          padding: 10px 14px;
          /* Handoff #5 §3 — entrante: surface con borde, radio asimétrico. */
          border-radius: 18px 18px 18px 4px;
          background: var(--surface, #fff);
          border: 1px solid var(--border, #e6ddcf);
          color: var(--fg-strong, #22252a);
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          cursor: default;
        }
        .bubble-row.is-mine .bubble {
          background: var(--navy-800, #1e2d4a);
          border-color: transparent;
          color: var(--cream, #f8f4ee);
          border-radius: 18px 18px 4px 18px;
        }
        .bubble p,
        .bubble-row.is-mine .bubble p {
          margin: 0;
          white-space: pre-wrap;
          color: inherit;
        }

        /* Reply snippet (cuando este mensaje responde a otro) */
        .reply-snippet {
          display: flex;
          flex-direction: column;
          padding: 6px 12px;
          background: var(--surface-sunk);
          border-left: 3px solid var(--info);
          border-radius: 8px;
          max-width: 100%;
          margin-bottom: 2px;
        }
        .reply-snippet-author {
          font-size: 11px;
          font-weight: 700;
          color: var(--info);
        }
        .reply-snippet-text {
          font-size: 12px;
          opacity: 0.7;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 280px;
        }

        /* Acciones — ocultas por default, visibles on hover o si el picker está abierto */
        .bubble-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.15s;
          pointer-events: none;
        }
        .bubble-flex:hover .bubble-actions,
        .bubble-stack.picker-open .bubble-actions {
          opacity: 1;
          pointer-events: auto;
        }
        .bubble-row.is-mine .bubble-actions {
          flex-direction: row-reverse;
        }

        .bubble-time {
          font-size: 11px;
          opacity: 0.55;
          color: var(--fg-muted);
          white-space: nowrap;
        }
        .bubble-action-buttons {
          display: flex;
          gap: 2px;
        }
        :global(.bubble-action) {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: var(--surface-sunk);
          color: var(--fg-strong);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        :global(.bubble-action:hover) {
          background: var(--accent-soft);
          color: var(--info);
        }

        /* Picker de reacciones */
        .reaction-picker {
          position: absolute;
          bottom: calc(100% + 6px);
          left: auto;
          right: 0;
          display: flex;
          gap: 4px;
          padding: 6px 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          z-index: 5;
        }
        .bubble-row.is-mine .reaction-picker {
          right: auto;
          left: 0;
        }
        :global(.reaction-emoji) {
          font-size: 20px;
          line-height: 1;
          padding: 4px 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: transform 0.1s, background 0.15s;
        }
        :global(.reaction-emoji:hover) {
          background: var(--surface-sunk);
          transform: scale(1.25);
        }

        /* Resumen de reacciones (pills debajo del bubble) */
        .reactions-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }
        :global(.reaction-chip) {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        :global(.reaction-chip:hover) {
          background: var(--accent-soft);
        }
        :global(.reaction-chip.is-mine-reaction) {
          background: var(--accent-soft);
          border-color: var(--info);
          color: var(--info);
          font-weight: 700;
        }
        :global(.reaction-chip-emoji) {
          font-size: 14px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

/* ─── Modal de reporte ─── */

interface ReportModalProps {
  message: ConversationMessage;
  onCancel: () => void;
  onSubmit: (reason: MessageReportReason, detail: string) => void;
  isSubmitting: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ message, onCancel, onSubmit, isSubmitting }) => {
  const t = useTranslations('messages');
  const [reason, setReason] = useState<MessageReportReason>('spam');
  const [detail, setDetail] = useState('');
  const [consent, setConsent] = useState(false);

  return (
    <div className="report-overlay" onClick={onCancel}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <header className="report-header">
          <h4>{t('report.title')}</h4>
          <button type="button" className="report-close" onClick={onCancel} aria-label={t('report.close')}>
            <i className="fal fa-times" />
          </button>
        </header>

        <div className="report-preview">
          <small>{t('report.previewLabel')}</small>
          <p>{message.content}</p>
        </div>

        <div className="report-body">
          <label className="report-label">{t('report.reason')}</label>
          {REPORT_REASONS.map((r) => (
            <label key={r} className="report-option">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              <span>{t(`report.reasons.${r}`)}</span>
            </label>
          ))}

          <label className="report-label" style={{ marginTop: '14px' }}>
            {t('report.detail')}
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={t('report.detailPlaceholder')}
            rows={3}
            maxLength={500}
          />

          <label className="report-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{t('report.consent')}</span>
          </label>
        </div>

        <footer className="report-footer">
          <button type="button" className="report-cancel" onClick={onCancel} disabled={isSubmitting}>
            {t('report.cancel')}
          </button>
          <button
            type="button"
            className="fill-btn"
            onClick={() => onSubmit(reason, detail)}
            disabled={isSubmitting || !consent}
          >
            {isSubmitting ? t('report.sending') : t('report.submit')}
          </button>
        </footer>
      </div>

      <style jsx>{`
        .report-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .report-modal {
          background: var(--surface);
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .report-header h4 {
          margin: 0;
          font-size: 17px;
        }
        .report-close {
          border: none;
          background: transparent;
          color: var(--fg-strong);
          font-size: 16px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .report-close:hover {
          background: var(--surface-sunk);
        }
        .report-preview {
          padding: 14px 20px;
          background: var(--surface-sunk);
          border-bottom: 1px solid var(--border);
        }
        .report-preview small {
          font-size: 12px;
          opacity: 0.7;
          display: block;
          margin-bottom: 4px;
        }
        .report-preview p {
          margin: 0;
          font-size: 14px;
          color: var(--fg-strong);
        }
        .report-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
        }
        .report-label {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--fg-strong);
        }
        .report-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s;
        }
        .report-option:hover {
          background: var(--surface-sunk);
        }
        .report-option input {
          accent-color: var(--info);
        }
        .report-body textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--fg-strong);
          font-family: inherit;
          font-size: 13px;
          resize: vertical;
          outline: none;
        }
        .report-body textarea:focus {
          border-color: var(--info);
        }
        .report-consent {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 14px;
          font-size: 13px;
          opacity: 0.85;
          line-height: 1.4;
          cursor: pointer;
        }
        .report-consent input {
          margin-top: 3px;
          flex-shrink: 0;
        }
        .report-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--border);
        }
        .report-cancel {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--fg-strong);
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .report-cancel:hover {
          background: var(--surface-sunk);
        }
        :global(.report-footer .fill-btn) {
          padding: 8px 22px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ConversationView;
