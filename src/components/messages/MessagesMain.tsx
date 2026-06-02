"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeChanger from '@/components/home/ThemeChanger';
import { useAuth } from '@/utils/AuthContext';
import { ApiError } from '@/utils/Api';
import { useInbox } from '@/hooks/api/useMessages';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import InboxList from './InboxList';
import ConversationView from './ConversationView';
import ConversationInfoPanel from './ConversationInfoPanel';

const MessagesMain: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inboxQuery = useInbox();

  // En móvil alternamos entre 'list' y 'chat' — un panel a la vez.
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');

  const activePubId = useMemo(() => {
    const v = searchParams.get('pub');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const activeContactId = useMemo(() => {
    const v = searchParams.get('with');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const hasActiveConversation = activePubId !== null && activeContactId !== null;

  // Fase 10.4: si solo viene ?pub=ID (ej. desde un anuncio de "mensajes"),
  // resolvemos el dueño y autocompletamos ?with=ownerId para abrir la conversación.
  const needsOwnerResolve = activePubId !== null && activeContactId === null;
  const pubDetailQuery = usePublicationDetail(needsOwnerResolve ? activePubId : null);
  useEffect(() => {
    if (!needsOwnerResolve) return;
    const ownerId = pubDetailQuery.data?.cus_id;
    if (ownerId && user?.id && ownerId !== user.id) {
      router.replace(`/messages?pub=${activePubId}&with=${ownerId}`);
    } else if (ownerId && user?.id && ownerId === user.id) {
      // Si el viewer es el propio dueño, no tiene sentido abrir chat consigo mismo.
      router.replace('/messages');
    }
  }, [needsOwnerResolve, pubDetailQuery.data?.cus_id, user?.id, activePubId, router]);

  // Cuando se activa una conversación en móvil → mostrar el chat automáticamente.
  useEffect(() => {
    if (hasActiveConversation) setMobilePanel('chat');
  }, [hasActiveConversation]);

  useEffect(() => {
    if (user?.id && activeContactId === user.id) {
      router.replace('/messages');
    }
  }, [user?.id, activeContactId, router]);

  const activeInboxItem = useMemo(() => {
    if (!hasActiveConversation || !inboxQuery.data) return null;
    return (
      inboxQuery.data.find(
        (i) => i.pub_id === activePubId && i.contact_id === activeContactId,
      ) || null
    );
  }, [inboxQuery.data, hasActiveConversation, activePubId, activeContactId]);

  const handleMobileBack = () => {
    setMobilePanel('list');
    router.replace('/messages');
  };

  return (
    <main className="messages-page">
      <ThemeChanger />

      <div className={`msg-shell${hasActiveConversation ? ' has-info' : ''}`}>

        {/* ── Col izquierda: inbox ── */}
        <aside className={`msg-sidebar${mobilePanel === 'chat' ? ' mobile-hidden' : ''}`}>
          <div className="msg-sidebar-head">
            <h4 className="msg-sidebar-title">Chats</h4>
          </div>

          {inboxQuery.isLoading && (
            <div className="msg-state">Cargando…</div>
          )}
          {inboxQuery.error && (
            <div className="msg-state msg-state-error">
              {inboxQuery.error instanceof ApiError
                ? inboxQuery.error.message
                : 'No se pudieron cargar los chats.'}
            </div>
          )}
          {!inboxQuery.isLoading && !inboxQuery.error && (
            <InboxList
              items={inboxQuery.data ?? []}
              activePubId={activePubId}
              activeContactId={activeContactId}
            />
          )}
        </aside>

        {/* ── Col central: conversación ── */}
        <div className={`msg-body${mobilePanel === 'list' && !hasActiveConversation ? ' mobile-hidden' : ''}`}>
          {/* Botón volver — solo en móvil */}
          {mobilePanel === 'chat' && (
            <button type="button" className="msg-back-btn" onClick={handleMobileBack}>
              <i className="fal fa-arrow-left" />
              Chats
            </button>
          )}

          {!hasActiveConversation ? (
            <div className="msg-empty">
              <i className="fal fa-comments" />
              <h4>Seleccioná una conversación</h4>
              <p>Elegí un chat de la lista para empezar.</p>
            </div>
          ) : (
            <ConversationView
              pubId={activePubId!}
              contactId={activeContactId!}
              inboxItem={activeInboxItem}
            />
          )}
        </div>

        {/* ── Col derecha: info / shortcuts ── */}
        {hasActiveConversation && (
          <ConversationInfoPanel
            pubId={activePubId!}
            contactId={activeContactId!}
            inboxItem={activeInboxItem}
          />
        )}

      </div>

      <style jsx>{`
        /* ── Página ── */
        .messages-page {
          /* Ocupa el espacio disponible entre header y footer */
          padding: 0;
        }

        /* ── Shell: 3 cols en desktop, 2 en tablet, 1 en móvil ── */
        .msg-shell {
          display: grid;
          grid-template-columns: 300px 1fr;
          height: calc(100vh - 90px);
          border-top: 1px solid rgba(128, 128, 128, 0.18);
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          overflow: hidden;
          background: var(--clr-bg-white, #fff);
        }
        .msg-shell.has-info {
          grid-template-columns: 300px 1fr 270px;
        }

        /* ── Sidebar izquierdo ── */
        .msg-sidebar {
          border-right: 1px solid rgba(128, 128, 128, 0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--clr-bg-white, #fff);
        }
        .msg-sidebar-head {
          padding: 20px 16px 14px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          flex-shrink: 0;
        }
        .msg-sidebar-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: var(--clr-common-heading, #181818);
        }

        /* ── Centro ── */
        .msg-body {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }
        .msg-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 40px;
          text-align: center;
          opacity: 0.5;
        }
        .msg-empty :global(i) {
          font-size: 56px;
          color: var(--clr-theme-1, #0f4c4c);
        }
        .msg-empty h4 {
          margin: 0;
          font-size: 18px;
        }
        .msg-empty p {
          margin: 0;
          font-size: 14px;
        }

        /* ── Botón volver (solo móvil) ── */
        .msg-back-btn {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 700;
          color: var(--clr-theme-1, #0f4c4c);
          cursor: pointer;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          width: 100%;
          text-align: left;
        }

        /* ── Estados ── */
        .msg-state {
          padding: 20px;
          font-size: 14px;
          opacity: 0.7;
        }
        .msg-state-error {
          color: #ef4444;
          opacity: 1;
        }

        /* ── Responsive ── */

        /* Tablet: quitar panel derecho */
        @media (max-width: 1100px) {
          .msg-shell.has-info {
            grid-template-columns: 280px 1fr;
          }
          .msg-shell.has-info > :global(aside.info-panel) {
            display: none;
          }
        }

        /* Móvil: un panel a la vez */
        @media (max-width: 680px) {
          .msg-shell,
          .msg-shell.has-info {
            grid-template-columns: 1fr;
            height: calc(100vh - 70px);
          }
          .msg-back-btn {
            display: flex;
          }
          .mobile-hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
};

export default MessagesMain;
