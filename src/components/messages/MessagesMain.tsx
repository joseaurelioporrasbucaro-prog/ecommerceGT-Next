"use client";
import React, { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { ApiError } from '@/utils/Api';
import { useInbox } from '@/hooks/api/useMessages';
import InboxList from './InboxList';
import ConversationView from './ConversationView';

/**
 * Pantalla de mensajes — sidebar de conversaciones a la izquierda + panel de
 * conversación activa a la derecha. La selección activa vive en search params
 * (`?pub=X&with=Y`) para que sea bookmarkeable y compartible (al menos entre
 * usuarios autorizados — el backend valida ownership de la conversación).
 *
 * Entry points:
 *  - /messages → muestra la lista, sin conversación activa (placeholder).
 *  - /messages?pub=X&with=Y → abre la conversación con ese seller para esa pub.
 *    Es el target del botón "Contactar" en el detalle de publicación.
 */
const MessagesMain: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inboxQuery = useInbox();

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

  // Si el usuario llega con ?pub=X&with=self por error, lo corregimos.
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

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Mensajes" breadcrumbSubTitle="Mensajes" />

      <section className="messages-area pt-90 pb-90">
        <div className="container c-container-1">
          <div className="messages-shell">
            <aside className="messages-sidebar">
              <h4 className="messages-sidebar-title">Conversaciones</h4>
              {inboxQuery.isLoading && (
                <div className="messages-state">Cargando…</div>
              )}
              {inboxQuery.error && (
                <div className="messages-state messages-state-error">
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

            <div className="messages-content">
              {!hasActiveConversation && (
                <div className="messages-empty">
                  <i className="flaticon-chatting" />
                  <h4>Selecciona una conversación</h4>
                  <p>Elegí un chat de la lista para ver los mensajes.</p>
                </div>
              )}
              {hasActiveConversation && (
                <ConversationView
                  pubId={activePubId!}
                  contactId={activeContactId!}
                  inboxItem={activeInboxItem}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .messages-shell {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 0;
          min-height: 70vh;
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 14px;
          overflow: hidden;
          background: var(--clr-bg-white, #fff);
        }
        @media (max-width: 768px) {
          .messages-shell {
            grid-template-columns: 1fr;
          }
        }
        .messages-sidebar {
          border-right: 1px solid rgba(128, 128, 128, 0.18);
          display: flex;
          flex-direction: column;
          background: rgba(128, 128, 128, 0.04);
        }
        .messages-sidebar-title {
          padding: 18px 20px;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
        }
        .messages-content {
          display: flex;
          flex-direction: column;
          min-height: 70vh;
        }
        .messages-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          opacity: 0.7;
        }
        .messages-empty :global(i) {
          font-size: 48px;
          margin-bottom: 16px;
          color: var(--clr-theme-1, #6c5ce7);
        }
        .messages-empty h4 {
          margin: 0 0 8px;
        }
        .messages-empty p {
          margin: 0;
          font-size: 14px;
        }
        .messages-state {
          padding: 20px;
          font-size: 14px;
          opacity: 0.7;
        }
        .messages-state-error {
          color: #ef4444;
          opacity: 1;
        }
      `}</style>
    </main>
  );
};

export default MessagesMain;
