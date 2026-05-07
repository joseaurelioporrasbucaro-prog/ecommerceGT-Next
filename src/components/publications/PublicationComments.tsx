"use client";

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import ForumComment from '@/components/comments/ForumComment';
import ForumReply from '@/components/comments/ForumReply';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { useAddComment, usePublicationComments } from '@/hooks/api/usePublicationComments';
import type { Comment } from '@/types/api';

interface PublicationCommentsProps {
  pubId: number;
}

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';

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

function groupReplies(comments: Comment[]): Map<number, Comment[]> {
  const groupedReplies = new Map<number, Comment[]>();
  comments.forEach((comment) => {
    if (comment.parent_id === null) return;
    const replies = groupedReplies.get(comment.parent_id) ?? [];
    replies.push(comment);
    groupedReplies.set(comment.parent_id, replies);
  });
  return groupedReplies;
}

const PublicationComments = ({ pubId }: PublicationCommentsProps) => {
  const { user } = useAuth();
  const commentsQuery = usePublicationComments(pubId);
  const addCommentMutation = useAddComment(pubId);
  const comments = commentsQuery.data ?? [];
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const rootComments = useMemo(
    () => comments.filter((c) => c.parent_id === null),
    [comments],
  );
  const repliesByParent = useMemo(() => groupReplies(comments), [comments]);
  const replyTarget = parentId
    ? comments.find((comment) => comment.comment_id === parentId)
    : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setFormError('Escribe un comentario antes de publicar.');
      return;
    }

    setFormError(null);

    try {
      await addCommentMutation.mutateAsync({
        content: trimmedContent,
        parent_id: parentId,
      });
      setContent('');
      setParentId(null);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Error inesperado');
    }
  };

  return (
    <section className="about-info-area pt-80 pb-90">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-10 mx-auto">
            <div className="section-title1 mb-30">
              <h2 className="section-main-title1">Comentarios</h2>
            </div>

            <div className="publication-comment-form mb-30">
              {user ? (
                <form onSubmit={handleSubmit}>
                  {replyTarget && (
                    <div className="reply-target">
                      Respondiendo a {replyTarget.cus_first_name} {replyTarget.cus_last_name}
                      <button type="button" onClick={() => setParentId(null)}>
                        Cancelar
                      </button>
                    </div>
                  )}
                  <textarea
                    className="form-control"
                    rows={4}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={parentId ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
                    disabled={addCommentMutation.isPending}
                  />
                  {formError && <div className="text-danger mt-2">{formError}</div>}
                  <button
                    type="submit"
                    className="fill-btn-rounded mt-15"
                    disabled={addCommentMutation.isPending}
                  >
                    {parentId ? 'Responder' : 'Comentar'}
                  </button>
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
                  <Link href={`/login?from=${encodeURIComponent(`/publications/${pubId}`)}`} className="fill-btn-rounded mt-15">
                    Inicia sesión para comentar
                  </Link>
                </div>
              )}
            </div>

            {commentsQuery.isLoading && (
              <div className="alert alert-info">Cargando comentarios...</div>
            )}

            {commentsQuery.error && (
              <div className="alert alert-danger">{getErrorMessage(commentsQuery.error)}</div>
            )}

            {!commentsQuery.isLoading && !commentsQuery.error && rootComments.length === 0 && (
              <div className="alert alert-warning">Esta publicación todavía no tiene comentarios.</div>
            )}

            {/* Lista de comentarios estilo Forum */}
            <div className="forum-post-wrapper publication-comments-list">
              {rootComments.map((comment) => {
                const { date, time } = formatCommentDate(comment.created_at);
                const replies = repliesByParent.get(comment.comment_id) ?? [];
                return (
                  <ForumComment
                    key={comment.comment_id}
                    authorName={`${comment.cus_first_name} ${comment.cus_last_name}`}
                    authorHref={`/creator-profile/${comment.cus_id}`}
                    avatarSrc={DEFAULT_AVATAR}
                    date={date}
                    time={time}
                    content={comment.content}
                    repliesCount={replies.length}
                    onReply={user ? () => setParentId(comment.comment_id) : undefined}
                  >
                    {replies.length > 0 && (
                      <div className="q-answers mb-30">
                        {replies.map((reply) => {
                          const { date: rDate, time: rTime } = formatCommentDate(reply.created_at);
                          return (
                            <ForumReply
                              key={reply.comment_id}
                              authorName={`${reply.cus_first_name} ${reply.cus_last_name}`}
                              authorHref={`/creator-profile/${reply.cus_id}`}
                              avatarSrc={DEFAULT_AVATAR}
                              date={rDate}
                              time={rTime}
                              content={reply.content}
                              onReply={user ? () => setParentId(comment.comment_id) : undefined}
                            />
                          );
                        })}
                      </div>
                    )}
                  </ForumComment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* El scaffold ya pone border-top y border-right en cada .q-meta-item.
           Aquí cerramos la caja agregando border-bottom — y ese mismo border
           hace de separador entre comentarios, así no hay doble línea. */
        :global(.publication-comments-list .publication-comment-item) {
          margin-bottom: 30px;
        }
        :global(.publication-comments-list .publication-comment-item:last-child) {
          margin-bottom: 0;
        }
        :global(.publication-comments-list .q-meta-content .q-meta-item) {
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }
        :global(.publication-comments-list .forum-reply-action) {
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        :global(.publication-comments-list .forum-reply-action:hover) {
          color: var(--tp-theme-1, #6c5ce7);
        }
        .publication-comment-form {
          border: 1px solid rgba(128, 128, 128, 0.2);
          border-radius: 8px;
          padding: 18px;
        }
        .publication-comment-form :global(textarea) {
          resize: vertical;
          min-height: 110px;
          border-color: rgba(128, 128, 128, 0.25);
        }
        .reply-target {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--tp-theme-1, #6c5ce7);
        }
        .reply-target button {
          background: transparent;
          border: 0;
          color: inherit;
          font-weight: 600;
        }
        .login-comment-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        /* Respuestas anidadas: indentación con border-left morado sutil */
        :global(.publication-comments-list .q-answers) {
          margin-top: 20px;
          padding-left: 24px;
          border-left: 2px solid rgba(108, 92, 231, 0.2);
        }
        :global(.publication-comments-list .q-single-answer + .q-single-answer) {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(128, 128, 128, 0.15);
        }
      `}</style>
    </section>
  );
};

export default PublicationComments;
