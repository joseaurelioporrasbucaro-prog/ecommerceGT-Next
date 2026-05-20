"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import ForumComment from '@/components/comments/ForumComment';
import ForumReply from '@/components/comments/ForumReply';
import MentionTextarea from '@/components/comments/MentionTextarea';
import { renderCommentContent } from '@/components/comments/renderCommentContent';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { useAddComment, usePublicationComments } from '@/hooks/api/usePublicationComments';
import { useToggleCommentLike } from '@/hooks/api/useToggleCommentLike';
import type { Comment } from '@/types/api';
import { getPublicationStatusInfo } from './publicationUtils';

interface PublicationCommentsProps {
  pubId: number;
  /** Estado de la publicación. Si está cerrada (vendida/anulada), se bloquea comentar. */
  pubstaId: number;
}

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';

interface CommentNode extends Comment {
  children: CommentNode[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

function formatCommentDate(value: string): { date: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value, time: '' };
  return {
    date: new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(d),
    time: new Intl.DateTimeFormat('es-GT', { timeStyle: 'short' }).format(d),
  };
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
// Form inline que aparece debajo del comentario al que respondes
// ============================================================================

interface InlineReplyFormProps {
  authorName: string;
  isPending: boolean;
  onSubmit: (content: string) => Promise<void> | void;
  onCancel: () => void;
}

const InlineReplyForm = ({ authorName, isPending, onSubmit, onCancel }: InlineReplyFormProps) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Escribe algo antes de enviar.');
      return;
    }
    setError(null);
    try {
      await onSubmit(trimmed);
      setContent('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    }
  };

  return (
    <form className="inline-reply-form" onSubmit={handleSubmit}>
      <div className="inline-reply-target">
        <i className="fal fa-reply"></i>
        Respondiendo a <strong>{authorName}</strong>
      </div>
      <MentionTextarea
        rows={3}
        value={content}
        onChange={setContent}
        placeholder={`Escribe tu respuesta a ${authorName}... (usa @ para mencionar)`}
        disabled={isPending}
        autoFocus
      />
      {error && <div className="text-danger inline-reply-error">{error}</div>}
      <div className="inline-reply-actions">
        <button
          type="button"
          className="btn-cancel-reply"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-submit-reply"
          disabled={isPending}
        >
          <i className="fal fa-paper-plane"></i>
          {isPending ? 'Enviando...' : 'Enviar respuesta'}
        </button>
      </div>

      <style jsx>{`
        .inline-reply-form {
          margin-top: 14px;
          padding: 16px;
          background: rgba(108, 92, 231, 0.06);
          border: 1.5px solid rgba(108, 92, 231, 0.25);
          border-radius: 10px;
        }
        .inline-reply-target {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          color: var(--tp-theme-1, #6c5ce7);
        }
        .inline-reply-form :global(textarea) {
          width: 100%;
          resize: vertical;
          min-height: 80px;
          border: 1px solid rgba(128, 128, 128, 0.3);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
        }
        .inline-reply-form :global(textarea:focus) {
          border-color: var(--tp-theme-1, #6c5ce7);
          outline: 0;
        }
        .inline-reply-error {
          margin-top: 6px;
          font-size: 13px;
          color: #ef4444;
        }
        .inline-reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }
        .btn-cancel-reply {
          padding: 8px 16px;
          background: transparent;
          color: inherit;
          border: 1.5px solid rgba(128, 128, 128, 0.35);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.18s ease;
        }
        .btn-cancel-reply:hover:not(:disabled) {
          border-color: #ef4444;
          color: #ef4444;
        }
        .btn-submit-reply {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff;
          border: 1.5px solid var(--tp-theme-1, #6c5ce7);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.18s ease;
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.25);
        }
        .btn-submit-reply:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(108, 92, 231, 0.4);
        }
        .btn-submit-reply:disabled,
        .btn-cancel-reply:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
};

// ============================================================================
// Componente recursivo de un nodo de la cascada
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
}: CommentNodeProps) => {
  const { date, time } = formatCommentDate(node.created_at);
  const authorName = `${node.cus_first_name} ${node.cus_last_name}`;
  const authorHref = `/creator-profile/${node.cus_id}`;
  const isReplyingHere = replyingTo === node.comment_id;
  const likeHandler = isClosed ? undefined : () => onLike(node.comment_id);

  const replyForm = isReplyingHere && (
    <InlineReplyForm
      authorName={authorName}
      isPending={isPending}
      onSubmit={(content) => onSubmitReply(node.comment_id, content)}
      onCancel={() => setReplyingTo(null)}
    />
  );

  const childrenView = node.children.length > 0 && (
    <div className="cascade-children">
      {node.children.map((child) => (
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
        />
      ))}
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
        repliesCount={node.children.length}
        onReply={canReply ? () => setReplyingTo(node.comment_id) : undefined}
      >
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
    >
      {replyForm}
      {childrenView}
    </ForumReply>
  );
};

// ============================================================================
// Componente principal
// ============================================================================

const PublicationComments = ({ pubId, pubstaId }: PublicationCommentsProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const commentsQuery = usePublicationComments(pubId);
  const addCommentMutation = useAddComment(pubId);
  const toggleLikeMutation = useToggleCommentLike(pubId);
  const comments = commentsQuery.data ?? [];

  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const statusInfo = getPublicationStatusInfo(pubstaId);
  const isClosed = statusInfo.isClosed;
  const canComment = !!user && !isClosed;

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
      setFormError('Escribe un comentario antes de publicar.');
      return;
    }
    setFormError(null);
    try {
      await addCommentMutation.mutateAsync({ content: trimmed, parent_id: null });
      setContent('');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Error inesperado');
    }
  };

  const handleReplySubmit = async (parentId: number, replyContent: string) => {
    await addCommentMutation.mutateAsync({ content: replyContent, parent_id: parentId });
    setReplyingTo(null);
  };

  return (
    <section className="about-info-area pt-80 pb-90">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-10 mx-auto">
            <div className="section-title1 mb-30">
              <h2 className="section-main-title1">Comentarios</h2>
            </div>

            {/* Aviso si la publicación está cerrada */}
            {isClosed && (
              <div className="closed-publication-notice">
                <i className="fal fa-lock"></i>
                Esta publicación está {statusInfo.label.toLowerCase()} y ya no acepta nuevos comentarios.
              </div>
            )}

            {commentsQuery.isLoading && (
              <div className="alert alert-info">Cargando comentarios...</div>
            )}

            {commentsQuery.error && (
              <div className="alert alert-danger">{getErrorMessage(commentsQuery.error)}</div>
            )}

            {!commentsQuery.isLoading && !commentsQuery.error && tree.length === 0 && (
              <div className="alert alert-warning">Esta publicación todavía no tiene comentarios.</div>
            )}

            {/* Árbol de cascada */}
            <div className="forum-post-wrapper publication-comments-list cascade-tree">
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
                />
              ))}
            </div>

            {/* Form para NUEVO comentario root al final */}
            {!isClosed && (
              <div className="publication-comment-form mt-40">
                {user ? (
                  <form onSubmit={handleNewCommentSubmit}>
                    <label className="form-label-bold">
                      <i className="fal fa-comment"></i>
                      Deja un comentario
                    </label>
                    <MentionTextarea
                      rows={4}
                      value={content}
                      onChange={setContent}
                      placeholder="Escribe un comentario... (usa @ para mencionar)"
                      disabled={addCommentMutation.isPending}
                    />
                    {formError && <div className="text-danger mt-2">{formError}</div>}
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="btn-submit-comment"
                        disabled={addCommentMutation.isPending}
                      >
                        <i className="fal fa-paper-plane"></i>
                        {addCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="login-comment-box">
                    <textarea
                      className="form-control"
                      rows={3}
                      value=""
                      placeholder="Inicia sesión para comentar"
                      disabled
                      readOnly
                    />
                    <Link
                      href={`/login?from=${encodeURIComponent(`/publications/${pubId}`)}`}
                      className="btn-submit-comment mt-15"
                    >
                      <i className="fal fa-sign-in"></i>
                      Inicia sesión para comentar
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Aviso de cierre */
        .closed-publication-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          margin-bottom: 24px;
          background: rgba(239, 68, 68, 0.08);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-weight: 600;
          font-size: 14px;
        }
        .closed-publication-notice :global(i) {
          font-size: 18px;
        }

        /* Cascada — separador entre comentarios root */
        :global(.cascade-tree .publication-comment-item) {
          margin-bottom: 30px;
        }
        :global(.cascade-tree .publication-comment-item:last-child) {
          margin-bottom: 0;
        }

        /* Cierre de la caja del meta-content */
        :global(.cascade-tree .q-meta-content .q-meta-item) {
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }

        /* Hijos cascadeados — indentación + línea morada vertical */
        :global(.cascade-tree .cascade-children) {
          margin-top: 20px;
          padding-left: 24px;
          border-left: 2px solid rgba(108, 92, 231, 0.2);
        }
        :global(.cascade-tree .q-single-answer + .q-single-answer) {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(128, 128, 128, 0.15);
        }
        :global(.cascade-tree .ans-meta-content) {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 14px 4px 4px;
          margin-top: 12px;
          border-top: 1px solid rgba(128, 128, 128, 0.18);
        }
        :global(.cascade-tree .ans-meta-content .q-meta-item) {
          padding: 0;
          border: 0;
          height: auto;
          background: transparent;
        }
        :global(.cascade-tree .ans-meta-content .q-meta-item button) {
          background: transparent;
          color: inherit;
          border: 0;
          cursor: pointer;
          padding: 0;
        }
        :global(.cascade-tree .ans-meta-content .q-meta-item button:hover) {
          color: var(--tp-theme-1, #6c5ce7);
        }

        /* ---------- Form de nuevo comentario root ---------- */
        .publication-comment-form {
          padding: 20px;
          background: rgba(128, 128, 128, 0.04);
          border: 1.5px solid rgba(108, 92, 231, 0.2);
          border-radius: 12px;
        }
        .form-label-bold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 12px;
          color: var(--tp-theme-1, #6c5ce7);
        }
        .publication-comment-form :global(textarea) {
          width: 100%;
          resize: vertical;
          min-height: 110px;
          border: 1px solid rgba(128, 128, 128, 0.3);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
        }
        .publication-comment-form :global(textarea:focus) {
          border-color: var(--tp-theme-1, #6c5ce7);
          outline: 0;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 14px;
        }

        /* ---------- Botón principal de Comentar / Iniciar sesión ---------- */
        :global(.btn-submit-comment) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff !important;
          border: 2px solid var(--tp-theme-1, #6c5ce7);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none !important;
          transition: all 0.2s ease;
          box-shadow: 0 6px 16px rgba(108, 92, 231, 0.3);
        }
        :global(.btn-submit-comment:hover:not(:disabled)) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(108, 92, 231, 0.45);
        }
        :global(.btn-submit-comment:disabled) {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .login-comment-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* Menciones @handle linkificadas dentro de los comentarios (Fase 6.3.3) */
        :global(.comment-mention) {
          color: var(--tp-theme-1, #6c5ce7);
          font-weight: 600;
          text-decoration: none;
        }
        :global(.comment-mention:hover) {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default PublicationComments;
