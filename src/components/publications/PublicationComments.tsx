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

/** Respuesta aplanada a nivel 1. `replyToName` = a quién responde cuando es
 *  respuesta-a-respuesta (para mostrar la @mención); null si responde directo
 *  a la pregunta. */
interface FlatReply extends Comment {
  replyToName: string | null;
}

/** Hilo aplanado: pregunta (nivel 0) + todas sus respuestas en UN solo nivel. */
interface Thread {
  question: Comment;
  replies: FlatReply[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

/** Resuelve la URL del avatar de un usuario; placeholder si no tiene foto. */
function resolveAvatar(imagenu: string | null | undefined): string {
  if (!imagenu) return DEFAULT_AVATAR;
  return imagenu.startsWith('http') ? imagenu : getBackendUrl(imagenu);
}

const byDateAsc = (a: Comment, b: Comment) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

/**
 * Handoff #15 — aplana el árbol del backend a 2 niveles: pregunta (raíz) +
 * TODAS sus respuestas en una sola lista (sin anidar). La respuesta-a-respuesta
 * se marca con `replyToName` para la @mención, no un contenedor nuevo.
 */
function buildThreads(comments: Comment[]): Thread[] {
  const byId = new Map<number, Comment>();
  comments.forEach((c) => byId.set(c.comment_id, c));
  const roots = comments.filter((c) => c.parent_id === null).slice().sort(byDateAsc);

  return roots.map((question) => {
    const replies: FlatReply[] = [];
    const collect = (parentId: number) => {
      comments
        .filter((c) => c.parent_id === parentId)
        .forEach((child) => {
          const parent = child.parent_id != null ? byId.get(child.parent_id) : undefined;
          const replyToName =
            parent && parent.comment_id !== question.comment_id
              ? `${parent.cus_first_name} ${parent.cus_last_name}`
              : null;
          replies.push({ ...child, replyToName });
          collect(child.comment_id);
        });
    };
    collect(question.comment_id);
    replies.sort(byDateAsc);
    return { question, replies };
  });
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
// Hilo aplanado: pregunta (nivel 0) → respuestas (nivel 1) en una sola sangría.
// Sin cajas anidadas; la respuesta-a-respuesta se marca con @mención (Handoff #15).
// ============================================================================

interface QuestionThreadProps {
  question: Comment;
  replies: FlatReply[];
  canReply: boolean;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
  isPending: boolean;
  /** undefined cuando la publicación está cerrada (no se puede dar like). */
  onLike?: (commentId: number) => void;
  currentUserId: number | null;
  sellerId: number | null;
}

const QuestionThread = ({
  question,
  replies,
  canReply,
  replyingTo,
  setReplyingTo,
  onSubmitReply,
  isPending,
  onLike,
  currentUserId,
  sellerId,
}: QuestionThreadProps) => {
  const t = useTranslations('publications');
  const dateFmt = useDateFmt();
  const [expanded, setExpanded] = useState(false);

  const qName = `${question.cus_first_name} ${question.cus_last_name}`;
  const qHref = `/creator-profile/${question.cus_id}`;
  const canReportQ = currentUserId != null && currentUserId !== question.cus_id;

  const collapses = replies.length > REPLIES_COLLAPSE_THRESHOLD;
  const visibleReplies =
    collapses && !expanded ? replies.slice(0, REPLIES_COLLAPSE_THRESHOLD) : replies;
  const hiddenCount = replies.length - visibleReplies.length;

  const replyForm = (parentId: number, name: string) => (
    <InlineReplyForm
      authorName={name}
      isPending={isPending}
      onSubmit={(content) => onSubmitReply(parentId, content)}
      onCancel={() => setReplyingTo(null)}
    />
  );

  return (
    <ForumComment
      authorName={qName}
      authorHref={qHref}
      avatarSrc={resolveAvatar(question.authorImage)}
      date={dateFmt.medium(question.created_at, question.created_at)}
      time={dateFmt.time(question.created_at, '')}
      content={renderCommentContent(question.content, question.mentions)}
      likes={question.likesCount}
      isLiked={question.isLiked}
      onLike={onLike ? () => onLike(question.comment_id) : undefined}
      repliesCount={replies.length}
      onReply={canReply ? () => setReplyingTo(question.comment_id) : undefined}
      likesLabel={t('comments.likesLabel')}
      replyLabel={t('comments.replyLabel')}
    >
      {canReportQ && (
        <div className="kq-report-row">
          <ReportCommentButton commentId={question.comment_id} />
        </div>
      )}

      {(replyingTo === question.comment_id || replies.length > 0) && (
        <div className="kq-thread">
          {/* Responder a la pregunta → form arriba del hilo. */}
          {replyingTo === question.comment_id && replyForm(question.comment_id, qName)}

          {visibleReplies.map((reply) => {
            const rName = `${reply.cus_first_name} ${reply.cus_last_name}`;
            const rHref = `/creator-profile/${reply.cus_id}`;
            const isSeller = sellerId != null && reply.cus_id === sellerId;
            const canReportR = currentUserId != null && currentUserId !== reply.cus_id;

            return (
              <React.Fragment key={reply.comment_id}>
                <ForumReply
                  authorName={rName}
                  authorHref={rHref}
                  avatarSrc={resolveAvatar(reply.authorImage)}
                  date={dateFmt.medium(reply.created_at, reply.created_at)}
                  time={dateFmt.time(reply.created_at, '')}
                  content={
                    <>
                      {reply.replyToName && (
                        <span className="kq-reply-mention">@{reply.replyToName} </span>
                      )}
                      {renderCommentContent(reply.content, reply.mentions)}
                    </>
                  }
                  likes={reply.likesCount}
                  isLiked={reply.isLiked}
                  onLike={onLike ? () => onLike(reply.comment_id) : undefined}
                  onReply={canReply ? () => setReplyingTo(reply.comment_id) : undefined}
                  likesLabel={t('comments.likesLabel')}
                  replyLabel={t('comments.replyLabel')}
                  isSeller={isSeller}
                  sellerLabel={t('comments.sellerBadge')}
                >
                  {canReportR && (
                    <div className="kq-report-row">
                      <ReportCommentButton commentId={reply.comment_id} />
                    </div>
                  )}
                </ForumReply>
                {/* Responder a una respuesta → form como hermano (no anida caja). */}
                {replyingTo === reply.comment_id && replyForm(reply.comment_id, rName)}
              </React.Fragment>
            );
          })}

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
      )}
    </ForumComment>
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

  const threads = useMemo(() => buildThreads(comments), [comments]);
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
  const questionCount = threads.length;

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

            {!commentsQuery.isLoading && !commentsQuery.error && threads.length === 0 && (
              <div className="kq-empty">
                <div className="kq-empty-icon">
                  <i className="fal fa-comments" />
                </div>
                <p className="kq-empty-title">{t('comments.emptyTitle')}</p>
                <p className="kq-empty-sub">{t('comments.emptySub')}</p>
              </div>
            )}

            {/* ───────── Hilos (aplanados a 2 niveles) ───────── */}
            {threads.length > 0 && (
              <div className="kq-questions">
                {threads.map((thread) => (
                  <QuestionThread
                    key={thread.question.comment_id}
                    question={thread.question}
                    replies={thread.replies}
                    canReply={canComment}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onSubmitReply={handleReplySubmit}
                    isPending={addCommentMutation.isPending}
                    onLike={isClosed ? undefined : handleLike}
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

        /* === Hilo de respuestas (Handoff #15: 1 sola sangría, sin cajas anidadas) === */
        .kq-questions :global(.kq-thread) {
          margin-top: 16px;
          margin-left: 56px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        /* Comunidad: respuesta PLANA (avatar + texto), sin caja ni fondo. */
        .kq-questions :global(.kq-answer) {
          padding: 2px 0;
        }
        /* Vendedor: franja lavanda compacta con chip "Vendedor". */
        .kq-questions :global(.kq-answer.is-seller) {
          padding: 12px 14px;
          background: var(--accent-soft);
          border-left: 3px solid var(--lav-500);
          border-radius: var(--r-md);
        }
        /* @mención (a quién responde): lavanda, al inicio del texto. */
        .kq-questions :global(.kq-reply-mention) {
          color: var(--accent);
          font-weight: 700;
        }
        :global([data-theme='dark']) .kq-questions :global(.kq-reply-mention) {
          color: var(--lav-400);
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
            margin-left: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default PublicationComments;
