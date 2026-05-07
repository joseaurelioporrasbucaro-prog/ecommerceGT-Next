"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { ApiError } from '@/utils/Api';
import { usePublicationComments } from '@/hooks/api/usePublicationComments';
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
  const commentsQuery = usePublicationComments(pubId);
  const comments = commentsQuery.data ?? [];

  const rootComments = useMemo(
    () => comments.filter((c) => c.parent_id === null),
    [comments],
  );
  const repliesByParent = useMemo(() => groupReplies(comments), [comments]);

  return (
    <section className="about-info-area pt-80 pb-90">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-10 mx-auto">
            <div className="section-title1 mb-30">
              <h2 className="section-main-title1">Comentarios</h2>
              <p className="text-muted mt-2" style={{ fontSize: '14px', opacity: 0.7 }}>
                Los comentarios se muestran en modo lectura. La respuesta autenticada se conectará en Fase 4.
              </p>
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
                  <div key={comment.comment_id} className="q-single-wrapper publication-comment-item">
                    {/* Comentario principal */}
                    <div className="q-single-content">
                      <div className="author-name-time">
                        <div className="profile-img pos-rel">
                          <Link href={`/creator-profile/${comment.cus_id}`}>
                            <Image
                              src={DEFAULT_AVATAR}
                              alt={`${comment.cus_first_name} ${comment.cus_last_name}`}
                              width={50}
                              height={50}
                              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          </Link>
                        </div>
                        <div className="name-post-time">
                          <h4 className="artist-name">
                            <Link href={`/creator-profile/${comment.cus_id}`}>
                              {comment.cus_first_name} {comment.cus_last_name}
                            </Link>
                          </h4>
                          <div className="post-date-time">
                            <div className="post-date">{date}</div>
                            {time && (
                              <div className="post-time item-border-before">{time}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p>{comment.content}</p>
                    </div>

                    {/* Acciones (like / responder) — placeholder visual */}
                    <div className="q-meta-content">
                      <div className="q-meta-item">
                        <div className="q-meta-icon">
                          <i className="flaticon-heart"></i>
                        </div>
                        <div className="q-meta-likes">0</div>
                        <div className="q-meta-type">Likes</div>
                      </div>
                      <div className="q-meta-item">
                        <div className="q-meta-icon">
                          <i className="flaticon-chatting"></i>
                        </div>
                        <div className="q-meta-comments">{replies.length}</div>
                        <div className="q-meta-type">Respuestas</div>
                      </div>
                    </div>

                    {/* Respuestas anidadas */}
                    {replies.length > 0 && (
                      <div className="q-answers mb-30">
                        {replies.map((reply) => {
                          const { date: rDate, time: rTime } = formatCommentDate(reply.created_at);
                          return (
                            <div key={reply.comment_id} className="q-single-answer">
                              <div className="author-name-time">
                                <div className="profile-img pos-rel">
                                  <Link href={`/creator-profile/${reply.cus_id}`}>
                                    <Image
                                      src={DEFAULT_AVATAR}
                                      alt={`${reply.cus_first_name} ${reply.cus_last_name}`}
                                      width={50}
                                      height={50}
                                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                  </Link>
                                </div>
                                <div className="name-post-time">
                                  <h4 className="artist-name">
                                    <Link href={`/creator-profile/${reply.cus_id}`}>
                                      {reply.cus_first_name} {reply.cus_last_name}
                                    </Link>
                                  </h4>
                                  <div className="post-date-time">
                                    <div className="post-date">{rDate}</div>
                                    {rTime && <div className="post-time item-border-before">{rTime}</div>}
                                  </div>
                                </div>
                              </div>
                              <div className="answer-text">{reply.content}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
