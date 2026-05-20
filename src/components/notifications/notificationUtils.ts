import type { AppNotification, NotificationType } from '@/types/api';

export interface NotificationContent {
  /** Texto principal — describe la acción del actor. */
  text: string;
  /** Snippet o detalle secundario (puede ser null). */
  snippet: string | null;
  /** Href para navegar al recurso relacionado. */
  href: string;
  /** Ícono Font Awesome (sin el prefijo `fal`). */
  icon: string;
  /** Color del badge del ícono. */
  iconColor: string;
}

const fullName = (notif: AppNotification): string => {
  const first = notif.actor_first_name?.trim() ?? '';
  const last = notif.actor_last_name?.trim() ?? '';
  const full = `${first} ${last}`.trim();
  return full || 'Alguien';
};

const snippetFromPayload = (payload: Record<string, unknown>): string | null => {
  const v = payload?.snippet;
  return typeof v === 'string' ? v : null;
};

/**
 * Mapea una notificación a texto, link, ícono y color. Usado por
 * NotificationItem (dropdown del bell) y por la página /activity.
 */
export function getNotificationContent(notif: AppNotification): NotificationContent {
  const name = fullName(notif);
  const snippet = snippetFromPayload(notif.payload);

  const cfg: Record<NotificationType, () => NotificationContent> = {
    mention: () => ({
      text: `${name} te mencionó en un comentario`,
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-at',
      iconColor: '#6c5ce7',
    }),
    reply: () => ({
      text: `${name} respondió a tu comentario`,
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-reply',
      iconColor: '#0984e3',
    }),
    comment: () => ({
      text: `${name} comentó en tu publicación`,
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-comment-alt',
      iconColor: '#0984e3',
    }),
    comment_like: () => ({
      text: `A ${name} le gustó tu comentario`,
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-heart',
      iconColor: '#e84393',
    }),
    pub_favorite: () => ({
      text: `${name} guardó tu publicación en favoritos`,
      snippet: null,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-bookmark',
      iconColor: '#fdcb6e',
    }),
    message: () => ({
      text: `${name} te envió un mensaje`,
      snippet,
      href:
        notif.pub_id && notif.actor_cus_id
          ? `/messages?pub=${notif.pub_id}&with=${notif.actor_cus_id}`
          : '/messages',
      icon: 'fa-comment',
      iconColor: '#00b894',
    }),
    sale_closed: () => {
      const token = notif.payload?.surveyToken;
      const pubTitle = typeof notif.payload?.pubTitle === 'string' ? notif.payload.pubTitle : null;
      return {
        text: `${name} cerró la venta contigo. ¡Califícalo!`,
        snippet: pubTitle,
        // Link directo al formulario de calificación (calificar desde la notificación)
        href: typeof token === 'string' ? `/survey/${token}` : '/activity',
        icon: 'fa-handshake',
        iconColor: '#16a34a',
      };
    },
    review_received: () => {
      const stars = typeof notif.payload?.stars === 'number' ? notif.payload.stars : null;
      return {
        text: stars
          ? `${name} te calificó con ${stars} ${stars === 1 ? 'estrella' : 'estrellas'}`
          : `${name} te dejó una reseña`,
        snippet,
        href: notif.recipient_cus_id ? `/creator-profile/${notif.recipient_cus_id}` : '/activity',
        icon: 'fa-star',
        iconColor: '#f59e0b',
      };
    },
  };

  return cfg[notif.notif_type]();
}

/**
 * Devuelve tiempo relativo en español (estilo "hace 5 min").
 * Cubre los casos comunes; para >7 días devuelve la fecha corta.
 */
export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'ahora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} d`;
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
}
