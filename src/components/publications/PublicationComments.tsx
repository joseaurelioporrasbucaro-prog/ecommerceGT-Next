"use client";

import React, { useMemo } from 'react';
import { ApiError } from '@/utils/Api';
import { usePublicationComments } from '@/hooks/api/usePublicationComments';
import type { Comment } from '@/types/api';

interface PublicationCommentsProps {
  pubId: number;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

function formatCommentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function groupReplies(comments: Comment[]): Map<number, Comment[]> {
  const groupedReplies = new Map<number, Comment[]>();

  comments.forEach((comment) => {
    if (comment.parent_id === null) {
      return;
    }

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
    () => comments.filter((comment) => comment.parent_id === null),
    [comments],
  );
  const repliesByParent = useMemo(() => groupReplies(comments), [comments]);

  return (
    <section className="about-info-area pt-80 pb-90">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <div className="section-title1 mb-30">
              <h2 className="section-main-title1">Comentarios</h2>
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

            <div className="forum-post-wrapper mb-30">
              {rootComments.map((comment) => (
                <div key={comment.comment_id} className="q-single-wrapper mb-30">
                  <div className="q-single-content">
                    <div className="author-name-time">
                      <div className="name-post-time">
                        <h4 className="artist-name">
                          {comment.cus_first_name} {comment.cus_last_name}
                        </h4>
                        <div className="post-date-time">
                          <div className="post-date">{formatCommentDate(comment.created_at)}</div>
                        </div>
                      </div>
                    </div>
                    <p>{comment.content}</p>
                  </div>

                  {(repliesByParent.get(comment.comment_id) ?? []).map((reply) => (
                    <div key={reply.comment_id} className="q-single-content ms-4 mt-20">
                      <div className="author-name-time">
                        <div className="name-post-time">
                          <h4 className="artist-name">
                            {reply.cus_first_name} {reply.cus_last_name}
                          </h4>
                          <div className="post-date-time">
                            <div className="post-date">{formatCommentDate(reply.created_at)}</div>
                          </div>
                        </div>
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="about-info-item mb-30">
              <h4 className="about-info-title">Participación</h4>
              <p>
                Los comentarios se muestran en modo lectura durante esta fase.
                La respuesta autenticada se conectará en Fase 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationComments;
