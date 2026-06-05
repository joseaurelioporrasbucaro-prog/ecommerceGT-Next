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

type TranslationValue = string | number | Date;
type NotificationsT = (key: string, values?: Record<string, TranslationValue>) => string;

const fullName = (notif: AppNotification, fallback: string): string => {
  const first = notif.actor_first_name?.trim() ?? '';
  const last = notif.actor_last_name?.trim() ?? '';
  const full = `${first} ${last}`.trim();
  return full || fallback;
};

const snippetFromPayload = (payload: Record<string, unknown>): string | null => {
  const v = payload?.snippet;
  return typeof v === 'string' ? v : null;
};

/**
 * Mapea una notificación a texto, link, ícono y color. Usado por
 * NotificationItem (dropdown del bell) y por la página /activity.
 */
export function getNotificationContent(
  notif: AppNotification,
  t: NotificationsT,
  formatMoney: (value: number) => string,
): NotificationContent {
  const name = fullName(notif, t('actorFallback'));
  const snippet = snippetFromPayload(notif.payload);

  const cfg: Record<NotificationType, () => NotificationContent> = {
    mention: () => ({
      text: t('content.mention', { name }),
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-at',
      iconColor: '#6c5ce7',
    }),
    reply: () => ({
      text: t('content.reply', { name }),
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-reply',
      iconColor: '#0984e3',
    }),
    comment: () => ({
      text: t('content.comment', { name }),
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-comment-alt',
      iconColor: '#0984e3',
    }),
    comment_like: () => ({
      text: t('content.commentLike', { name }),
      snippet,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-heart',
      iconColor: '#e84393',
    }),
    pub_favorite: () => ({
      text: t('content.pubFavorite', { name }),
      snippet: null,
      href: notif.pub_id ? `/publications/${notif.pub_id}` : '/activity',
      icon: 'fa-bookmark',
      iconColor: '#fdcb6e',
    }),
    message: () => ({
      text: t('content.message', { name }),
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
        text: t('content.saleClosed', { name }),
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
          ? t('content.reviewStars', { name, stars })
          : t('content.reviewReceived', { name }),
        snippet,
        href: notif.recipient_cus_id ? `/creator-profile/${notif.recipient_cus_id}` : '/activity',
        icon: 'fa-star',
        iconColor: '#f59e0b',
      };
    },
    company_added: () => {
      const busName = typeof notif.payload?.busName === 'string' ? notif.payload.busName : null;
      return {
        text: busName ? t('content.companyAddedNamed', { busName }) : t('content.companyAdded'),
        snippet: null,
        href: '/company',
        icon: 'fa-building',
        iconColor: '#5a5af2',
      };
    },
    company_invite: () => {
      const busName = typeof notif.payload?.busName === 'string' ? notif.payload.busName : null;
      const token = typeof notif.payload?.token === 'string' ? notif.payload.token : null;
      return {
        text: busName
          ? t('content.companyInviteNamed', { name, busName })
          : t('content.companyInvite', { name }),
        snippet: t('content.companyInviteSnippet'),
        href: token ? `/invite/${token}` : '/activity',
        icon: 'fa-user-plus',
        iconColor: '#5a5af2',
      };
    },
    company_invite_accepted: () => ({
      text: t('content.companyInviteAccepted', { name }),
      snippet: null,
      href: '/company',
      icon: 'fa-user-check',
      iconColor: '#16a34a',
    }),
    verification_approved: () => {
      const isBusiness = notif.payload?.verType === 'business';
      return {
        text: isBusiness ? t('content.businessVerified') : t('content.accountVerified'),
        snippet: t('content.verifiedSnippet'),
        href: notif.recipient_cus_id ? `/creator-profile/${notif.recipient_cus_id}` : '/activity',
        icon: 'fa-check-circle',
        iconColor: '#16a34a',
      };
    },
    verification_rejected: () => {
      const reason = typeof notif.payload?.reason === 'string' ? notif.payload.reason : null;
      return {
        text: t('content.verificationRejected'),
        snippet: reason ? t('content.reason', { reason }) : t('content.verificationRetry'),
        href: '/creator-profile-info-personal',
        icon: 'fa-times-circle',
        iconColor: '#dc2626',
      };
    },
    ticket_reply: () => {
      const ticketId = notif.payload?.ticketId;
      return {
        text: t('content.ticketReply', { name }),
        snippet: null,
        href: typeof ticketId === 'number' ? `/soporte/tickets/${ticketId}` : '/soporte/tickets',
        icon: 'fa-comment-dots',
        iconColor: '#6c5ce7',
      };
    },
    ticket_assigned: () => {
      const ticketId = notif.payload?.ticketId;
      const subject = typeof notif.payload?.subject === 'string' ? notif.payload.subject : null;
      return {
        text: t('content.ticketAssigned'),
        snippet: subject,
        href: typeof ticketId === 'number' ? `/soporte/tickets/${ticketId}` : '/soporte/tickets-admin',
        icon: 'fa-headset',
        iconColor: '#0984e3',
      };
    },
    // Fase 10.6: soporte anuló una publicación con campaña activa; se devolvió saldo.
    pub_sanctioned_refund: () => {
      const refunded = Number(notif.payload?.refunded || 0);
      return {
        text: t('content.pubSanctionedRefund'),
        snippet: refunded > 0 ? t('content.refundedCredit', { amount: formatMoney(refunded) }) : null,
        href: '/pauta',
        icon: 'fa-undo',
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
export function formatRelativeTime(
  iso: string,
  t: NotificationsT,
  formatShortDate: (iso: string) => string,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return t('relative.now');
  const min = Math.floor(sec / 60);
  if (min < 60) return t('relative.minutes', { count: min });
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return t('relative.hours', { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t('relative.days', { count: days });
  return formatShortDate(iso);
}
