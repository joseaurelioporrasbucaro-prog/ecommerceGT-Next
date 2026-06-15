"use client";

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ForumReplyProps {
  authorName: string;
  authorHref: string;
  avatarSrc: string | StaticImageData;
  date: string;
  time?: string;
  content: React.ReactNode;
  likes?: number;
  isLiked?: boolean;
  onLike?: () => void;
  /** Si se provee, muestra el botón "Responder". */
  onReply?: () => void;
  likesLabel?: string;
  replyLabel?: string;
  /** Respuesta del vendedor → tarjeta destacada con chip "Vendedor". */
  isSeller?: boolean;
  /** Texto del chip de vendedor (i18n). */
  sellerLabel?: string;
  /** Permite renderizar el form inline + sub-hilos anidados debajo. */
  children?: React.ReactNode;
}

/**
 * Tarjeta de una RESPUESTA a una pregunta. Cuando `isSeller` es true la
 * respuesta se destaca (fondo accent-soft, borde izquierdo lavanda, avatar
 * lavanda y chip "Vendedor") para dar jerarquía a la respuesta oficial.
 */
const ForumReply = ({
  authorName,
  authorHref,
  avatarSrc,
  date,
  time,
  content,
  likes = 0,
  isLiked = false,
  onLike,
  onReply,
  likesLabel = 'Me gusta',
  replyLabel = 'Responder',
  isSeller = false,
  sellerLabel = 'Vendedor',
  children,
}: ForumReplyProps) => (
  <div className={`kq-answer${isSeller ? ' is-seller' : ''}`}>
    <div className="kq-a-head">
      <Link
        href={authorHref}
        className={`kq-avatar kq-avatar-sm${isSeller ? ' kq-avatar-lav' : ' kq-avatar-navy'}`}
      >
        <Image
          src={avatarSrc}
          alt={authorName}
          width={36}
          height={36}
        />
      </Link>
      <div className="kq-a-meta">
        <span className="kq-a-author-row">
          <Link href={authorHref} className="kq-author">{authorName}</Link>
          {isSeller && (
            <span className="kq-seller-chip">
              <i className="fas fa-store" />
              {sellerLabel}
            </span>
          )}
        </span>
        <div className="kq-time">
          <span>{date}</span>
          {time && <span className="kq-time-sep">{time}</span>}
        </div>
      </div>
    </div>

    <div className="kq-text kq-a-text">{content}</div>

    <div className="kq-actions kq-a-actions">
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
      {onReply && (
        <button type="button" className="kq-action" onClick={onReply}>
          <i className="fal fa-reply" />
          <span className="kq-action-label">{replyLabel}</span>
        </button>
      )}
    </div>

    {children}
  </div>
);

export default ForumReply;
