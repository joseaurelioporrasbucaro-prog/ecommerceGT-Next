"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import ForumComment from '@/components/comments/ForumComment';
import ForumReply from '@/components/comments/ForumReply';
import MentionTextarea from '@/components/comments/MentionTextarea';
import { renderCommentContent } from '@/components/comments/renderCommentContent';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { useAddComment, usePublicationComments } from '@/hooks/api/usePublicationComments';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { useToggleCommentLike } from '@/hooks/api/useToggleCommentLike';
import ReportCommentButton from './ReportCommentButton';
import { useDateFmt } from '@/utils/datetime';
import type { Comment } from '@/types/api';
import { getPublicationStatusInfo } from './publicationUtils';

interface PublicationCommentsProps {
  pubId: number;
  /** Estado de la publicación. Si está cerrada (vendida/anulada), se bloquea comentar. */
  pubstaId: number;
}

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';
/** A partir de esta cantidad de respuestas, el hilo se colapsa por defecto. */
const REPLIES_COLLAPSE_THRESHOLD = 2;

interface CommentNode extends Comment {
  children: CommentNode[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

/** Resuelve la URL del avatar del usuario autenticado para el composer. */
function resolveAvatar(imagenu: string | null | undefined): string {
  if (!imagenu) return DEFAULT_AVATAR;
  return imagenu.startsWith('http') ? imagenu : getBackendUrl(imagenu);
}

/**
 * Construye un árbol de comentarios desde el array plano del backend.
 * Soporta múltiples niveles de anidación (estilo Reddit/Facebook).
 */
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((c) => {
    map.set(c.comment_id, { ...c, children: [] });
  });

  comments.forEach((c) => {
    const node = map.get(c.comment_id);
    if (!node) return;
    if (c.parent_id !== null && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Ordenar por fecha ascendente (los nuevos al final)
  const sortByDate = (nodes: CommentNode[]) => {
    nodes.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    nodes.forEach((n) => sortByDate(n.children));
  };
  sortByDate(roots);

  return roots;
}

// ============================================================================
// Form inline que aparece debajo de la pregunta/respuesta al responder
// ============================================================================

interface InlineReplyFormProps {
  authorName: string;
  isPending: boolean;
  onSubmit: (content: string) => Promise<void> | void;
  onCancel: () => void;
}

const InlineReplyForm = ({ authorName, isPending, onSubmit, onCancel }: InlineReplyFormProps) => {
  const t = useTranslations('publications');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError(t('comments.replyRequired'));
      return;
    }
    setError(null);
    try {
      await onSubmit(trimmed);
      setContent('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.unexpectedError'));
    }
  };

  return (
    <form className="kq-inline-reply" onSubmit={handleSubmit}>
      <div className="kq-inline-target">
        <i className="fal fa-reply" />
        {t('comments.replyingTo')} <strong>{authorName}</strong>
      </div>
      <MentionTextarea
        rows={3}
        value={content}
        onChange={setContent}
        placeholder={t('comments.replyPlaceholder', { name: authorName })}
        disabled={isPending}
        autoFocus
      />
      {error && <div className="kq-form-error">{error}</div>}
      <div className="kq-inline-actions">
        <button
          type="button"
          className="kq-btn-ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          {t('common.cancel')}
        </button>
        <button type="submit" className="kq-btn-green kq-btn-sm" disabled={isPending}>
          <i className="fal fa-paper-plane" />
          {isPending ? t('common.sending') : t('comments.sendReply')}
        </button>
      </div>

      <style jsx>{`
        .kq-inline-reply {
          margin-top: 14px;
          padding: 16px;
          background: var(--surface-sunk);
          border: 1.5px solid var(--border);
          border-radius: var(--r-md);
        }
        .kq-inline-target {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          color: var(--accent);
        }
        .kq-inline-target :global(strong) {
          color: var(--fg-strong);
          font-weight: 700;
        }
        :global([data-theme='dark']) .kq-inline-target {
          color: var(--lav-400);
        }
        .kq-inline-reply :global(textarea) {
          width: 100%;
          resize: vertical;
          min-height: 80px;
          background: var(--surface);
          color: var(--fg-strong);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          padding: 10px 12px;
          font-size: 14px;
          font-family: var(--font-body);
        }
        .kq-inline-reply :global(textarea:focus) {
          border-color: var(--accent);
          outline: 0;
          box-shadow: var(--shadow-focus);
        }
        .kq-form-error {
          margin-top: 6px;
          font-size: 13px;
          color: var(--danger);
        }
        .kq-inline-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }
        .kq-btn-ghost {
          padding: 8px 16px;
          background: transparent;
          color: var(--fg-strong);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-pill);
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.18s ease;
        }
        .kq-btn-ghost:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        :global([data-theme='dark']) .kq-btn-ghost:hover:not(:disabled) {
          color: var(--lav-400);
        }
        .kq-btn-green {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--green-500);
          color: var(--navy-900);
          border: 1.5px solid var(--green-500);
          border-radius: var(--r-pill);
          cursor: pointer;
          font-weight: 700;
          transition: all 0.18s ease;
          box-shadow: var(--shadow-xs);
        }
        .kq-btn-sm {
          padding: 8px 18px;
          font-size: 13px;
        }
        .kq-btn-green:hover:not(:disabled) {
          background: var(--green-600);
          border-color: var(--green-600);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .kq-btn-green:disabled,
        .kq-btn-ghost:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
};

// ============================================================================
// Nodo recursivo del hilo (pregunta raíz → respuestas)
// ============================================================================

interface CommentNodeProps {
  node: CommentNode;
  depth: number;
  canReply: boolean;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
  isPending: boolean;
  onLike: (commentId: number) => void;
  isClosed: boolean;
  currentUserId: number | null;
  sellerId: number | null;
}

const CommentNodeView = ({
  node,
  depth,
  canReply,
  replyingTo,
  setReplyingTo,
  onSubmitReply,
  isPending,
  onLike,
  isClosed,
  currentUserId,
  sellerId,
}: CommentNodeProps) => {
  const t = useTranslations('publications');
  const dateFmt = useDateFmt();
  const date = dateFmt.medium(node.created_at, node.created_at);
  const time = dateFmt.time(node.created_at, '');
  const authorName = `${node.cus_first_name} ${node.cus_last_name}`;
  const authorHref = `/creator-profile/${node.cus_id}`;
  const isReplyingHere = replyingTo === node.comment_id;
  const isSeller = sellerId != null && node.cus_id === sellerId;
  const likeHandler = isClosed ? undefined : () => onLike(node.comment_id);
  // Fase 8.4 — denunciar comentario (no el propio, y solo logueado).
  const canReport = currentUserId != null && currentUserId !== node.cus_id;

  // Colapso de hilos largos a nivel de pregunta raíz.
  const [expanded, setExpanded] = useState(false);
  const totalChildren = node.children.length;
  const collapses = depth === 0 && totalChildren > REPLIES_COLLAPSE_THRESHOLD;
  const visibleChildren =
    collapses && !expanded ? node.children.slice(0, REPLIES_COLLAPSE_THRESHOLD) : node.children;
  const hiddenCount = totalChildren - visibleChildren.length;

  const reportRow = canReport && (
    <div className="kq-report-row">
      <ReportCommentButton commentId={node.comment_id} />
    </div>
  );

  const replyForm = isReplyingHere && (
    <InlineReplyForm
      authorName={authorName}
      isPending={isPending}
      onSubmit={(content) => onSubmitReply(node.comment_id, content)}
      onCancel={() => setReplyingTo(null)}
    />
  );

  const renderChild = (child: CommentNode) => (
    <CommentNodeView
      key={child.comment_id}
      node={child}
      depth={depth + 1}
      canReply={canReply}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      onSubmitReply={onSubmitReply}
      isPending={isPending}
      onLike={onLike}
      isClosed={isClosed}
      currentUserId={currentUserId}
      sellerId={sellerId}
    />
  );

  const childrenView = totalChildren > 0 && (
    <div className="kq-thread">
      {visibleChildren.map(renderChild)}
      {collapses && !expanded && hiddenCount > 0 && (
        <button type="button" className="kq-show-more" onClick={() => setExpanded(true)}>
          <i className="fal fa-chevron-down" />
          {t('comments.showMoreReplies', { count: hiddenCount })}
        </button>
      )}
      {collapses && expanded && (
        <button type="button" className="kq-show-more" onClick={() => setExpanded(false)}>
          <i className="fal fa-chevron-up" />
          {t('comments.hideReplies')}
        </button>
      )}
    </div>
  );

  if (depth === 0) {
    return (
      <ForumComment
        authorName={authorName}
        authorHref={authorHref}
        avatarSrc={DEFAULT_AVATAR}
        date={date}
        time={time}
        content={renderCommentContent(node.content, node.mentions)}
        likes={node.likesCount}
        isLiked={node.isLiked}
        onLike={likeHandler}
        repliesCount={totalChildren}
        onReply={canReply ? () => setReplyingTo(node.comment_id) : undefined}
        likesLabel={t('comments.likesLabel')}
        replyLabel={t('comments.replyLabel')}
      >
        {reportRow}
        {replyForm}
        {childrenView}
      </ForumComment>
    );
  }

  return (
    <ForumReply
      authorName={authorName}
      authorHref={authorHref}
      avatarSrc={DEFAULT_AVATAR}
      date={date}
      time={time}
      content={renderCommentContent(node.content, node.mentions)}
      likes={node.likesCount}
      isLiked={node.isLiked}
      onLike={likeHandler}
      onReply={canReply ? () => setReplyingTo(node.comment_id) : undefined}
      likesLabel={t('comments.likesLabel')}
      replyLabel={t('comments.replyLabel')}
      isSeller={isSeller}
      sellerLabel={t('comments.sellerBadge')}
    >
      {reportRow}
      {replyForm}
      {childrenView}
    </ForumReply>
  );
};

// ============================================================================
// Componente principal
// ============================================================================

const PublicationComments = ({ pubId, pubstaId }: PublicationCommentsProps) => {
  const t = useTranslations('publications');
  const router = useRouter();
  const { user } = useAuth();
  const commentsQuery = usePublicationComments(pubId);
  const addCommentMutation = useAddComment(pubId);
  const toggleLikeMutation = useToggleCommentLike(pubId);
  // Solo para identificar al vendedor (dueño de la publicación). React-query
  // reusa el caché del detalle si ya se cargó; no añade lógica nueva de API.
  const detailQuery = usePublicationDetail(pubId);
  const sellerId = detailQuery.data?.cus_id ?? null;
  const comments = commentsQuery.data ?? [];

  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const statusInfo = getPublicationStatusInfo(pubstaId, {
    sold: t('status.sold'),
    soldSub: t('status.soldSub'),
    void: t('status.void'),
    voidSub: t('status.voidSub'),
    draft: t('status.draft'),
    draftSub: t('status.draftSub'),
    available: t('status.available'),
    availableSub: t('status.availableSub'),
  });
  const isClosed = statusInfo.isClosed;
  const canComment = !!user && !isClosed;
  const questionCount = tree.length;

  const handleLike = (commentId: number) => {
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(`/publications/${pubId}`)}`);
      return;
    }
    toggleLikeMutation.mutate(commentId);
  };

  const handleNewCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setFormError(t('comments.commentRequired'));
      return;
    }
    setFormError(null);
    try {
      await addCommentMutation.mutateAsync({ content: trimmed, parent_id: null });
      setContent('');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('common.unexpectedError'));
    }
  };

  const handleReplySubmit = async (parentId: number, replyContent: string) => {
    await addCommentMutation.mutateAsync({ content: replyContent, parent_id: parentId });
    setReplyingTo(null);
  };

  return (
    <section className="kq-comments-area">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            {/* ───────── Encabezado ───────── */}
            <header className="kq-comments-head">
              <h2 className="kq-comments-title">
                {t('comments.questionsTitle')}
                <span className="kq-count">{questionCount}</span>
              </h2>
              <p className="kq-comments-sub">{t('comments.questionsSubtitle')}</p>
            </header>

            {/* ───────── Composer pill ───────── */}
            {!isClosed && (
              <div className="kq-composer">
                {user ? (
                  <form className="kq-composer-form" onSubmit={handleNewCommentSubmit}>
                    <Image
                      src={resolveAvatar(user.imagenu)}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                      className="kq-composer-avatar"
                    />
                    <div className="kq-composer-fields">
                      <div className="kq-composer-input">
                        <MentionTextarea
                          rows={1}
                          value={content}
                          onChange={setContent}
                          placeholder={t('comments.askPlaceholder')}
                          disabled={addCommentMutation.isPending}
                        />
                      </div>
                      {formError && <div className="kq-form-error">{formError}</div>}
                      <div className="kq-composer-actions">
                        <button
                          type="submit"
                          className="kq-btn-green kq-btn-md"
                          disabled={addCommentMutation.isPending}
                        >
                          <i className="fal fa-paper-plane" />
                          {addCommentMutation.isPending
                            ? t('common.sending')
                            : t('comments.ask')}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="kq-login-box">
                    <Image
                      src={DEFAULT_AVATAR}
                      alt=""
                      width={44}
                      height={44}
                      className="kq-composer-avatar"
                    />
                    <div className="kq-login-pill">{t('comments.loginPlaceholder')}</div>
                    <Link
                      href={`/login?from=${encodeURIComponent(`/publications/${pubId}`)}`}
                      className="kq-btn-green kq-btn-md kq-login-cta"
                    >
                      <i className="fal fa-sign-in" />
                      {t('comments.loginCta')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Aviso si la publicación está cerrada */}
            {isClosed && (
              <div className="kq-closed-notice">
                <i className="fal fa-lock" />
                {t('comments.closedNotice', { status: statusInfo.label.toLowerCase() })}
              </div>
            )}

            {/* ───────── Estados ───────── */}
            {commentsQuery.isLoading && (
              <div className="kq-state kq-state-info">{t('comments.loading')}</div>
            )}

            {commentsQuery.error && (
              <div className="kq-state kq-state-error">
                {getErrorMessage(commentsQuery.error)}
              </div>
            )}

            {!commentsQuery.isLoading && !commentsQuery.error && tree.length === 0 && (
              <div className="kq-empty">
                <div className="kq-empty-icon">
                  <i className="fal fa-comments" />
                </div>
                <p className="kq-empty-title">{t('comments.emptyTitle')}</p>
                <p className="kq-empty-sub">{t('comments.emptySub')}</p>
              </div>
            )}

            {/* ───────── Hilos ───────── */}
            {tree.length > 0 && (
              <div className="kq-questions">
                {tree.map((node) => (
                  <CommentNodeView
                    key={node.comment_id}
                    node={node}
                    depth={0}
                    canReply={canComment}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onSubmitReply={handleReplySubmit}
                    isPending={addCommentMutation.isPending}
                    onLike={handleLike}
                    isClosed={isClosed}
                    currentUserId={user?.id ?? null}
                    sellerId={sellerId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .kq-comments-area {
          padding: 70px 0 90px;
        }

        /* ───────── Encabezado ───────── */
        .kq-comments-head {
          margin-bottom: 26px;
        }
        .kq-comments-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 6px;
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .kq-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 28px;
          padding: 0 10px;
          font-size: 15px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-soft);
          border-radius: var(--r-pill);
        }
        :global([data-theme='dark']) .kq-count {
          color: var(--lav-300);
        }
        .kq-comments-sub {
          margin: 0;
          font-size: 14.5px;
          color: var(--fg-muted);
        }

        /* ───────── Composer pill ───────── */
        .kq-composer {
          margin-bottom: 34px;
        }
        .kq-composer-form,
        .kq-login-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .kq-composer-form :global(.kq-composer-avatar),
        .kq-login-box :global(.kq-composer-avatar) {
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--lav-300);
        }
        .kq-composer-fields {
          flex: 1 1 auto;
          min-width: 0;
        }
        .kq-composer-input {
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-lg);
          padding: 4px 6px 4px 16px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .kq-composer-input:focus-within {
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }
        .kq-composer-input :global(textarea) {
          width: 100%;
          resize: none;
          min-height: 40px;
          padding: 8px 4px;
          background: transparent;
          color: var(--fg-strong);
          border: 0;
          outline: 0;
          font-size: 15px;
          font-family: var(--font-body);
          line-height: 1.5;
        }
        .kq-composer-input :global(textarea::placeholder) {
          color: var(--fg-subtle);
        }
        .kq-composer-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }

        /* Login (no logueado) */
        .kq-login-box {
          align-items: center;
          flex-wrap: wrap;
        }
        .kq-login-pill {
          flex: 1 1 240px;
          min-width: 0;
          padding: 13px 18px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-lg);
          color: var(--fg-subtle);
          font-size: 15px;
        }
        .kq-login-box :global(.kq-login-cta) {
          flex: 0 0 auto;
        }

        /* ───────── Botón verde (pill) ───────── */
        .kq-comments-area :global(.kq-btn-green) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--green-500);
          color: var(--navy-900) !important;
          border: 1.5px solid var(--green-500);
          border-radius: var(--r-pill);
          cursor: pointer;
          font-weight: 700;
          text-decoration: none !important;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .kq-comments-area :global(.kq-btn-md) {
          padding: 11px 26px;
          font-size: 14px;
        }
        .kq-comments-area :global(.kq-btn-green:hover) {
          background: var(--green-600);
          border-color: var(--green-600);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .kq-comments-area :global(.kq-btn-green:disabled) {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* ───────── Aviso de cierre ───────── */
        .kq-closed-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          margin-bottom: 26px;
          background: var(--danger-bg);
          border: 1.5px solid var(--danger);
          border-radius: var(--r-md);
          color: var(--danger);
          font-weight: 600;
          font-size: 14px;
        }
        .kq-closed-notice :global(i) {
          font-size: 18px;
        }

        /* ───────── Estados ───────── */
        .kq-state {
          padding: 14px 18px;
          margin-bottom: 18px;
          border-radius: var(--r-md);
          font-size: 14px;
        }
        .kq-state-info {
          background: var(--info-bg);
          color: var(--info);
          border: 1.5px solid var(--border);
        }
        .kq-state-error {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1.5px solid var(--danger);
        }

        /* ───────── Estado vacío ───────── */
        .kq-empty {
          text-align: center;
          padding: 48px 24px;
          background: var(--surface-sunk);
          border: 1.5px dashed var(--border-strong);
          border-radius: var(--r-lg);
        }
        .kq-empty-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 26px;
        }
        :global([data-theme='dark']) .kq-empty-icon {
          color: var(--lav-300);
        }
        .kq-empty-title {
          margin: 0 0 4px;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .kq-empty-sub {
          margin: 0;
          font-size: 14px;
          color: var(--fg-muted);
        }

        /* ───────── Lista de preguntas ───────── */
        .kq-questions {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* === Tarjeta de pregunta (ForumComment) === */
        .kq-questions :global(.kq-question) {
          padding: 22px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-xs);
        }
        .kq-questions :global(.kq-q-head),
        .kq-questions :global(.kq-a-head) {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .kq-questions :global(.kq-avatar) {
          display: inline-flex;
          flex: 0 0 auto;
          border-radius: 50%;
          overflow: hidden;
        }
        .kq-questions :global(.kq-avatar img) {
          border-radius: 50%;
          object-fit: cover;
        }
        .kq-questions :global(.kq-avatar-navy) {
          box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--navy-600);
        }
        .kq-questions :global(.kq-avatar-lav) {
          box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--accent);
        }
        .kq-questions :global(.kq-avatar-sm img) {
          width: 36px;
          height: 36px;
        }
        .kq-questions :global(.kq-author) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          color: var(--fg-strong);
          text-decoration: none;
        }
        .kq-questions :global(.kq-author:hover) {
          color: var(--accent);
        }
        .kq-questions :global(.kq-a-author-row) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .kq-questions :global(.kq-time) {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
          font-size: 12.5px;
          color: var(--fg-subtle);
        }
        .kq-questions :global(.kq-time-sep)::before {
          content: '·';
          margin-right: 8px;
        }
        .kq-questions :global(.kq-q-body) {
          margin: 14px 0 12px;
        }
        .kq-questions :global(.kq-q-title) {
          margin: 0 0 6px;
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .kq-questions :global(.kq-text) {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: var(--fg-strong);
          word-break: break-word;
        }
        .kq-questions :global(.kq-a-text) {
          margin: 12px 0;
        }

        /* === Acciones (like / responder) === */
        .kq-questions :global(.kq-actions) {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .kq-questions :global(.kq-action) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: 0;
          border-radius: var(--r-pill);
          color: var(--fg-muted);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.16s ease, color 0.16s ease;
        }
        .kq-questions :global(button.kq-action:hover) {
          background: var(--accent-soft);
          color: var(--accent);
        }
        :global([data-theme='dark']) .kq-questions :global(button.kq-action:hover) {
          color: var(--lav-300);
        }
        .kq-questions :global(.kq-action.is-static) {
          cursor: default;
        }
        .kq-questions :global(.kq-action.is-active) {
          color: var(--danger);
        }
        .kq-questions :global(.kq-action.is-active:hover) {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .kq-questions :global(.kq-action i) {
          font-size: 15px;
        }
        .kq-questions :global(.kq-action-count) {
          font-weight: 700;
        }

        /* === Hilo de respuestas === */
        .kq-questions :global(.kq-thread) {
          margin-top: 16px;
          padding-left: 22px;
          border-left: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .kq-questions :global(.kq-answer) {
          padding: 16px 18px;
          background: var(--surface-sunk);
          border: 1.5px solid var(--border);
          border-radius: var(--r-md);
        }
        .kq-questions :global(.kq-answer.is-seller) {
          background: var(--accent-soft);
          border-color: transparent;
          border-left: 3px solid var(--accent);
        }
        .kq-questions :global(.kq-seller-chip) {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--navy-900);
          background: var(--accent);
          border-radius: var(--r-pill);
        }
        :global([data-theme='dark']) .kq-questions :global(.kq-seller-chip) {
          color: var(--navy-900);
        }
        .kq-questions :global(.kq-seller-chip i) {
          font-size: 11px;
        }

        /* === "Ver N respuestas más" === */
        .kq-questions :global(.kq-show-more) {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          background: transparent;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-pill);
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .kq-questions :global(.kq-show-more:hover) {
          background: var(--accent-soft);
          border-color: var(--accent);
        }
        :global([data-theme='dark']) .kq-questions :global(.kq-show-more) {
          color: var(--lav-300);
        }

        /* === Fila de denuncia === */
        .kq-questions :global(.kq-report-row) {
          margin-top: 10px;
        }

        /* === Menciones @handle linkificadas === */
        :global(.comment-mention) {
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
        }
        :global(.comment-mention:hover) {
          text-decoration: underline;
        }
        :global([data-theme='dark']) :global(.comment-mention) {
          color: var(--lav-400);
        }

        /* === Form de error compartido (composer) === */
        .kq-form-error {
          margin-top: 8px;
          font-size: 13px;
          color: var(--danger);
        }

        @media (max-width: 575px) {
          .kq-comments-title {
            font-size: 23px;
          }
          .kq-login-box :global(.kq-login-cta) {
            flex: 1 1 100%;
            justify-content: center;
          }
          .kq-questions :global(.kq-thread) {
            padding-left: 14px;
          }
        }
      `}</style>
    </section>
  );
};

export default PublicationComments;
