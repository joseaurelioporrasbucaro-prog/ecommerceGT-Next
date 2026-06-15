"use client";

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ForumCommentProps {
  authorName: string;
  authorHref: string;
  avatarSrc: string | StaticImageData;
  date: string;
  time?: string;
  title?: React.ReactNode;
  content: React.ReactNode;
  afterContent?: React.ReactNode;
  likes?: number;
  isLiked?: boolean;
  onLike?: () => void;
  repliesCount?: number;
  onReply?: () => void;
  /** Etiquetas i18n (con fallback para no romper usos existentes). */
  likesLabel?: string;
  replyLabel?: string;
  children?: React.ReactNode;
}

/**
 * Tarjeta de una PREGUNTA sobre la propiedad (patrón Kiosqui).
 * Avatar navy + nombre + tiempo, el texto de la pregunta, y acciones
 * discretas (like / responder). El hilo de respuestas se renderiza vía
 * `children`.
 */
const ForumComment = ({
  authorName,
  authorHref,
  avatarSrc,
  date,
  time,
  title,
  content,
  afterContent,
  likes = 0,
  isLiked = false,
  onLike,
  repliesCount = 0,
  onReply,
  likesLabel = 'Me gusta',
  replyLabel = 'Responder',
  children,
}: ForumCommentProps) => (
  <article className="kq-question">
    <div className="kq-q-head">
      <Link href={authorHref} className="kq-avatar kq-avatar-navy">
        <Image
          src={avatarSrc}
          alt={authorName}
          width={44}
          height={44}
        />
      </Link>
      <div className="kq-q-meta">
        <Link href={authorHref} className="kq-author">{authorName}</Link>
        <div className="kq-time">
          <span>{date}</span>
          {time && <span className="kq-time-sep">{time}</span>}
        </div>
      </div>
    </div>

    <div className="kq-q-body">
      {title && <h4 className="kq-q-title">{title}</h4>}
      <p className="kq-text">{content}</p>
      {afterContent}
    </div>

    <div className="kq-actions">
      {onLike ? (
        <button
          type="button"
          className={`kq-action${isLiked ? ' is-active' : ''}`}
          onClick={onLike}
          aria-pressed={isLiked}
        >
          <i className={isLiked ? 'fas fa-heart' : 'fal fa-heart'} />
          <span className="kq-action-count">{likes}</span>
          <span className="kq-action-label">{likesLabel}</span>
        </button>
      ) : (
        <span className="kq-action is-static">
          <i className="fal fa-heart" />
          <span className="kq-action-count">{likes}</span>
          <span className="kq-action-label">{likesLabel}</span>
        </span>
      )}

      <span className="kq-action is-static">
        <i className="fal fa-comment" />
        <span className="kq-action-count">{repliesCount}</span>
      </span>

      {onReply && (
        <button type="button" className="kq-action" onClick={onReply}>
          <i className="fal fa-reply" />
          <span className="kq-action-label">{replyLabel}</span>
        </button>
      )}
    </div>

    {children}
  </article>
);

export default ForumComment;
