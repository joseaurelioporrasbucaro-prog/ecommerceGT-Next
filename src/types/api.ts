/**
 * Tipos de la API de `ecommerceGTBackEnd`.
 *
 * Reglas:
 * - Cada interfaz refleja LITERALMENTE lo que devuelve el backend (incluyendo casing
 *   en minúscula cuando Postgres devuelve aliases sin comillas, y nombres con typos
 *   como `levell`/`sizee`). Esto evita sorpresas en runtime.
 * - Cuando un endpoint devuelve un shape inconsistente (ej. array de un solo elemento
 *   en lugar de objeto), se tipa tal cual y se normaliza en el hook que lo consume.
 * - Los typos del backend están marcados con `// SIC:` para que en una fase futura,
 *   si se decide tocar `// Codigo Aurelio`, se sepa qué corregir y qué reemplazar.
 */

// ============================================================================
// Errores
// ============================================================================

export interface ApiErrorBody {
  message?: string;
  error?: string;
}

// ============================================================================
// Auth & Usuario
// ============================================================================

/**
 * Usuario tal como lo devuelve `GET /me`.
 * Mapeado manualmente en el backend (verifyMe), por eso sí respeta camelCase.
 *
 * IMPORTANTE: el campo `cus_user_name` del backend es legacy y guarda el email
 * (se usa para login). El handle público con `@` vive en `cus_handle`,
 * mapeado acá como `handle`.
 */
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  /** Alias público (@handle), único. Null hasta que el usuario lo configure. */
  handle: string | null;
  /** Veces que el usuario ya cambió su handle público. Límite actual: 2. */
  handleChangesCount: number;
  address: string | null;
  phone: string | null;
  birthday: string | null;
  genid: number | null;
  lang: string | null;
  isAdmin: boolean;
  imagenu: string | null;
  // Fase 7.3 — ubicación de perfil
  citId: number | null;
  towId: number | null;
  showLocation: boolean;
}

/** Payload para `PUT /handle`. */
export interface UpdateHandlePayload extends Record<string, unknown> {
  handle: string;
}

export interface UpdateHandleResponse {
  message: string;
  handle: string;
  handleChangesCount: number;
}

export interface HandleCheckResponse {
  available: boolean;
}

export interface HandleSuggestionsResponse {
  suggestions: string[];
}

export interface MeResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** `/login` cuando `passta_id === 1` (login normal, cookie seteada). */
export interface LoginSuccessResponse {
  message: string;
  idpwd: 1;
}

/** `/login` cuando `passta_id === 5` (debe forzar reset de password). */
export interface LoginForceResetResponse {
  cusid: number;
  email: string;
  idpwd: 5;
}

export type LoginResponse = LoginSuccessResponse | LoginForceResetResponse;

export interface RegisterPayload extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  handle?: string;
  isBusiness?: boolean;
  isEmployee?: boolean;
  busId?: number | string;
  busTName?: string;
  busName?: string;
}

// ============================================================================
// Catálogos
// ============================================================================

/** `GET /cat/countries` devuelve alias propios de la ruta ecommerce. */
export interface Country {
  country: number;
  description: string;
}

export interface CitiesPayload extends Record<string, unknown> {
  country: number;
}

/** `POST /cat/cities` devuelve alias propios de la ruta ecommerce. */
export interface City {
  city: number;
  description: string;
}

export interface MunicipalitiesPayload extends Record<string, unknown> {
  city: number;
}

/** `POST /cat/municipalities` devuelve alias propios de la ruta ecommerce. */
export interface Municipality {
  municipality: number;
  description: string;
}

export interface Gender {
  gen_id: number;
  gen_description: string;
}

export interface PublicationCategory {
  pubgen_id: number;
  pubgen_description: string;
}

export interface PublicationTransactionsPayload extends Record<string, unknown> {
  categorid: number;
}

/** `POST /cat/pubtransactions` devuelve la relación categoría-transacción. */
export interface PublicationTransaction {
  /** SIC backend: id de `cat_publication_transac_x_gender`, no de la transacción final. */
  pubtraid: number;
  /** SIC backend: id real de `cat_publication_transac`, usado por `POST /savepubl`. */
  pubtraidaux: number;
  description: string;
}

export interface PublicationStatus {
  pubsta_id: number;
  pubsta_description: string;
}

export interface PasswordStatus {
  passta_id: number;
  passta_description: string;
}

// ============================================================================
// Publicaciones
// ============================================================================

export interface PublicationImage {
  /** URL relativa que devuelve el backend, ej. `/uploads/images/<file>`. */
  url: string;
  /** Nombre/ID del archivo (ej. para borrarlo con `/deleteimg`). */
  id: string;
  /** Solo presente en `/publication/:id` (raw images table). */
  pubima_id?: number;
  pub_id?: number;
  pubima_name?: string;
  pubima_url?: string;
}

/**
 * Item de listado en `GET /publications` (sin sesión).
 * SIC: el backend usa `levell` y `sizee` en el alias SQL.
 */
export interface PublicationListItem {
  id: number;
  /** Estado de la publicación (1=Creada, 2=Publicada, 3=Vendida, 4=Anulada). */
  pubstaId: number;
  title: string;
  description: string;
  address: string;
  price: number | string;
  /** ISO 4217 — 'GTQ' o 'USD'. Default 'GTQ' en backend para legacy. */
  currency?: string | null;
  rooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  levell: number | null; // SIC backend: alias de `pd.pubdet_level`.
  sizee: number | null; // SIC backend: alias de `pd.pubdet_size`.
  country: string;
  city: string;
  town: string;
  category: string;
  image: string;
  images: PublicationImage[];
}

/** Mismo shape que `PublicationListItem` pero con sesión: añade `id_cus` y `isFavorite`. */
export interface PublicationListItemAuth extends PublicationListItem {
  id_cus: number;
  isFavorite: boolean;
}

export type AnyPublicationListItem = PublicationListItem | PublicationListItemAuth;

/**
 * Publicación detallada (`GET /publication/:id`). Combina filas de
 * `publications` + `publications_detail` + `images[]` + `user` (concat).
 * Los campos vienen en minúscula porque el SELECT usa `p.*, pd.*` sin alias.
 */
export interface PublicationDetail {
  pub_id: number;
  cus_id: number;
  pub_title: string;
  pub_description: string;
  pub_address: string;
  pubgen_id: number;
  pubtra_id: number;
  pubsta_id: number;
  pub_create_date: string;
  pub_views: number | null;
  pubdet_id: number | null;
  pubdet_price: number | string | null;
  /** ISO 4217 — 'GTQ' o 'USD'. */
  pubdet_currency?: string | null;
  pubdet_rooms: number | null;
  pubdet_bathrooms: number | null;
  pubdet_parking: number | null;
  pubdet_level: number | null;
  pubdet_size: number | null;
  cou_id: number | null;
  cit_id: number | null;
  tow_id: number | null;
  /** Concatenación `cus_first_name || ' ' || cus_last_name` desde el backend. */
  user: string;
  /** Conteo de filas activas en `ecom.publications_favorites`. */
  favoritesCount: number;
  /** Si el usuario autenticado ya guardó esta publicación. False sin sesión. */
  isFavorite: boolean;
  images: PublicationImage[];
}

/**
 * Shape de "Mis publicaciones" (`GET /my-publications/:cus_id`).
 * Usa `SELECT p.*, pd.<algunos campos>, main_image` así que es la fila cruda
 * de `publications` + un par de detalles + main_image.
 */
export interface MyPublicationItem {
  pub_id: number;
  cus_id: number;
  pub_title: string;
  pub_description: string;
  pub_address: string;
  pubgen_id: number;
  pubtra_id: number;
  pubsta_id: number;
  pub_create_date: string;
  pubdet_price: number | string | null;
  /** ISO 4217 — 'GTQ' o 'USD'. */
  pubdet_currency?: string | null;
  pubdet_rooms: number | null;
  pubdet_bathrooms: number | null;
  main_image: string | null;
}

/** Shape de "Mis favoritos" (`GET /myfavorites`). */
export interface FavoriteItem {
  id: number;
  /** Estado de la publicación (1=Creada, 2=Publicada, 3=Vendida, 4=Anulada). */
  pubstaId: number;
  title: string;
  description: string;
  address: string;
  price: number | string;
  /** ISO 4217 — 'GTQ' o 'USD'. */
  currency?: string | null;
  rooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  country: string;
  city: string;
  town: string;
  category: string;
  image: string;
  isFavorite: true;
}

/** Payload de `POST /savepubl`. `propertie` es el id de la categoría (1=casa, 2=apto, 3=terreno). */
export interface SavePublicationPayload {
  title: string;
  description: string;
  address: string;
  propertie: number;
  transaction: number;
  images: { id: string; url: string }[];
  price: number;
  country: number;
  city: number;
  municipality: number;
  noRooms?: number | null;
  noBathrooms?: number | null;
  noParking?: number | null;
  nlevel?: number | null;
  size?: number | null;
}

export interface SavePublicationResponse {
  message: string;
  id: number;
}

// ============================================================================
// Comentarios
// ============================================================================

/** Mención @handle resuelta a su cusId, para linkificar en el render (Fase 6.3.3). */
export interface CommentMention {
  handle: string;
  cusId: number;
}

export interface Comment {
  comment_id: number;
  content: string;
  created_at: string;
  cus_id: number;
  parent_id: number | null;
  cus_first_name: string;
  cus_last_name: string;
  likesCount: number;
  isLiked: boolean;
  /** @handle mencionados en el contenido, resueltos a cusId por el backend. */
  mentions?: CommentMention[];
}

/** Resultado del dropdown de menciones (@usuario) — GET /search/users (Fase 6.3.3). */
export interface UserSearchResult {
  cusId: number;
  handle: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

/** Respuesta de `POST /comments/:comment_id/like` (toggle). */
export interface ToggleCommentLikeResponse {
  liked: boolean;
  likesCount: number;
}

/** Respuesta de `DELETE /publications/:id` — soft-delete a `pubsta_id = 4`. */
export interface DeletePublicationResponse {
  pubId: number;
  pubstaId: number;
}

/** Respuesta de `POST /upload` (multipart, campo `image`). */
export interface UploadImageResponse {
  message: string;
  file: string;
  path: string;
  /**
   * Variantes optimizadas con sharp (Fase 5.4). Pueden estar vacías si el
   * procesamiento falló — el frontend debe caer al `path` original via onError.
   */
  variants?: {
    thumb?: string;
    card?: string;
    detail?: string;
  };
}

/** Imagen ya subida que se manda a `POST /savepubl`. `id` es el filename, `url` el path. */
export interface UploadedImage {
  id: string;
  url: string;
}

/** Body de `POST /savepubl`. SIC backend: nombres legacy, no camelCase. */
export interface CreatePublicationPayload extends Record<string, unknown> {
  title: string;
  description: string;
  address: string;
  /** pubgen_id: 1=Casa, 2=Apartamento, 3=Terreno. */
  propertie: number;
  /** pubtra_id (no el id de la tabla cruzada). */
  transaction: number;
  price: number;
  country: number;
  city: number;
  municipality: number;
  /** Casa(1) y Apto(2). Terreno(3) ignora estos. */
  noRooms: number | null;
  noBathrooms: number | null;
  noParking: number | null;
  /** Solo Apto(2). */
  nlevel: number | null;
  /** Solo Terreno(3). */
  size: number | null;
  /** ISO 4217 — 'GTQ' (default) o 'USD'. */
  currency: 'GTQ' | 'USD';
  images: UploadedImage[];
}

/** Respuesta de `POST /savepubl`. */
export interface CreatePublicationResponse {
  message: string;
  id: number;
}

/** Respuesta de `POST /checkerpub` — valida cuota de plan del usuario. */
export interface CheckerPublicationsResponse {
  message: string;
  create: boolean;
}

/**
 * Respuesta de `GET /publication/edit/:id` — datos del form de edición.
 * Notar nombres alias del backend (category=pubgen_id, transaction=pubtra_id, etc.).
 */
export interface PublicationEditData {
  id: number;
  cus_id: number;
  title: string;
  description: string;
  address: string;
  /** pubgen_id: 1=Casa, 2=Apto, 3=Terreno. */
  category: number;
  /** pubtra_id. */
  transaction: number;
  price: number | string | null;
  currency: 'GTQ' | 'USD' | string | null;
  rooms: string | number | null;
  bathrooms: string | number | null;
  parking: string | number | null;
  nlevel: string | number | null;
  size: string | number | null;
  country: number | null;
  city: number | null;
  municipality: number | null;
  images: UploadedImage[];
}

/** Body de `PUT /publications/:id`. Mismos campos que crear. */
export type UpdatePublicationPayload = CreatePublicationPayload;

/** Respuesta de `PUT /publications/:id`. */
export interface UpdatePublicationResponse {
  message: string;
  id: number;
}

export interface AddCommentPayload {
  pub_id: number;
  content: string;
  parent_id?: number | null;
}

export interface AddCommentResponse {
  message: string;
  comment: Comment;
}

export interface ToggleFavoritePayload extends Record<string, unknown> {
  idpubli: number;
}

export interface ToggleFavoriteResponse {
  message: string;
}

// ============================================================================
// Mensajería
// ============================================================================

export interface InboxItem {
  pub_id: number;
  pub_title: string;
  contact_id: number;
  contact_name: string;
  contact_image: string | null;
  last_msg_date: string;
  unread_conversation: number;
}

export interface ConversationMessage {
  message_id: number;
  pub_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SendMessagePayload {
  pub_id: number;
  receiver_id: number;
  content: string;
}

export interface UnreadCountResponse {
  total: number;
}

// ============================================================================
// Vendedor / reseñas
// ============================================================================

/**
 * `GET /infoCustomer/:id` devuelve un ARRAY de un solo elemento. Postgres convierte
 * los aliases sin comillas a minúscula, por eso son `firstname` y `totalpublis`.
 */
export interface SellerInfoRow {
  firstname: string;
  lastname: string;
  handle: string | null;
  imagenu: string | null;
  totalpublis: string | number;
  // Fase 7.2 — stats de perfil estilo plantilla
  address: string | null;
  joindate: string | null;
  likes: string | number;
  totalviews: string | number;
  followers: string | number;
  following: string | number;
  isfollowing: boolean;
  // Fase 7.3 — ubicación (solo presentes si showlocation = true)
  showlocation: boolean;
  department: string | null;
  municipality: string | null;
}
export type SellerInfoResponse = SellerInfoRow[];

export interface SellerReview {
  rating_stars: number;
  rating_comment: string | null;
  completed_at: string;
  cus_first_name: string;
  cus_last_name: string;
}

export interface SellerReviewsResponse {
  average: number;
  totalReviews: number;
  reviews: SellerReview[];
}

export interface SubmitSurveyPayload extends Record<string, unknown> {
  token: string;
  stars: number;
  comment: string;
}

export interface CloseSalePayload extends Record<string, unknown> {
  pub_id: number;
  buyer_id: number;
}

// ============================================================================
// Empresa / planes
// ============================================================================

export interface Company {
  busid: number;
  name: string;
  tradeName: string;
  address: string;
  phone: string;
  logo: string | null;
}

/** Fila cruda de `POST /getcompany` → { company: CompanyRow }. */
export interface CompanyRow {
  busid: number;
  bname: string;
  btname: string;
  baddress: string;
  bphone: string;
  blogo: string | null;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  isAdmin: boolean;
  createdAt: string | null;
}

/** Fila cruda de `POST /getemployees`. */
export interface EmployeeRow {
  cusid: number;
  firstname: string;
  lastname: string;
  email: string;
  dcreate: string | null;
  status: string;
  isadmin: boolean;
}

/** Payload para `POST /changeinfoc` (actualizar empresa). */
export interface UpdateCompanyPayload extends Record<string, unknown> {
  busid: number;
  bname: string;
  btname: string;
  baddress: string;
  bphone: string;
  busimg: string;
}

/** Payload para `POST /add-employee`. */
export interface AddEmployeePayload extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
}

/** Fila cruda de `POST /search-buyers` (búsqueda de usuarios por nombre/correo). */
export interface BuyerSearchRow {
  cus_id: number;
  cus_first_name: string | null;
  cus_last_name: string | null;
  cus_email_address: string | null;
}

/** Resultado normalizado de búsqueda de usuarios existentes. */
export interface BuyerSearchResult {
  cusId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Plan {
  id: number;
  description: string;
  /** Mensaje/eslogan corto del plan (sub_msg). */
  msg: string;
  /** Intervalo de cobro: "Mensual" | "Anual" (sub_interval). */
  interval: string;
  price: number;
  userLimit: number;
  pubPerUser: number;
}

/** Fila cruda de `POST /getplans` (alias del backend). */
export interface PlanRow {
  id: number;
  description: string;
  msg: string;
  recurrent: string;
  price: number | string;
  users: number;
  pubperuser: number;
}

/** Suscripción actual del usuario — `POST /my-subscription`. */
export interface MySubscription {
  subId: number;
  description: string;
  interval: string;
  price: number;
  userLimit: number;
  pubPerUser: number;
  /** Publicaciones usadas en el periodo actual (cussub_pubcount). */
  pubCount: number;
}

/** Fila cruda de `POST /my-subscription`. */
export interface MySubscriptionRow {
  subid: number;
  description: string;
  recurrent: string;
  price: number | string;
  users: number;
  pubperuser: number;
  pubcount: number;
}

export interface CheckerPubResponse {
  canPublish: boolean;
  remaining: number;
}

// ============================================================================
// Uploads
// ============================================================================

export interface UploadResponse {
  /** Nombre del archivo en disco, ej. `1700000000000-foto.jpg`. */
  filename: string;
  /** Ruta servida estáticamente, ej. `/uploads/images/1700000000000-foto.jpg`. */
  path: string;
}

export interface DeleteImagePayload {
  url: string;
}

// ============================================================================
// Helpers de tipo
// ============================================================================

/**
 * `Brand<T, K>` permite "marcar" un tipo primitivo para diferenciarlo de otros del
 * mismo tipo. Útil para IDs (PublicationId vs UserId) en fases futuras.
 */
export type Brand<T, K extends string> = T & { readonly __brand: K };

// ============================================================================
// Mensajería (Fase 6.1)
// ============================================================================

/** Una conversación en el inbox del usuario logueado. Backend: `GET /messages/inbox`. */
export interface InboxItem {
  pub_id: number;
  pub_title: string;
  contact_id: number;
  contact_name: string;
  contact_image: string | null;
  last_msg_date: string;
  unread_conversation: number;
}

/** Reacción agregada por emoji en un mensaje (Fase 6.2). */
export interface MessageReaction {
  emoji: string;
  count: number;
  /** true si el usuario actual reaccionó con ese emoji. */
  mine: boolean;
}

/** Razones aceptadas para reportar un mensaje. */
export type MessageReportReason = 'spam' | 'ofensivo' | 'estafa' | 'otro';

/**
 * Un mensaje individual dentro de una conversación.
 * Backend: `GET /messages/conversation/:pub_id/:other_user_id`.
 */
export interface ConversationMessage {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  pub_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_image: string | null;
  /** Fase 6.2: ID del mensaje al que se responde (null = no es reply). */
  reply_to_message_id: number | null;
  /** Snippet del mensaje padre (cuando reply_to_message_id != null). */
  reply_to_content: string | null;
  reply_to_sender_id: number | null;
  reply_to_sender_name: string | null;
  /** Reacciones agregadas por emoji. */
  reactions: MessageReaction[];
}

/** Body de `POST /messages/send`. */
export interface SendMessagePayload extends Record<string, unknown> {
  receiver_id: number;
  pub_id: number;
  content: string;
  /** Fase 6.2: opcional — id del mensaje al que se está respondiendo. */
  reply_to_message_id?: number | null;
}

/** Body de `POST /messages/:id/react`. */
export interface ReactToMessagePayload extends Record<string, unknown> {
  emoji: string;
}

/** Respuesta de `POST /messages/:id/react`. */
export interface ReactToMessageResponse {
  action: 'set' | 'removed';
  emoji?: string;
}

/** Body de `POST /messages/:id/report`. */
export interface ReportMessagePayload extends Record<string, unknown> {
  reason: MessageReportReason;
  detail?: string | null;
}

/** Respuesta de `POST /messages/send`. */
export interface SendMessageResponse {
  message: string;
  messageData: ConversationMessage;
}

/** Respuesta de `GET /messages/unread`. */
export interface UnreadMessagesResponse {
  unreadCount: number;
}

/** Body de `POST /messages/mark-read` — marca toda una conversación como leída. */
export interface MarkConversationReadPayload extends Record<string, unknown> {
  sender_id: number;
  pub_id: number;
}

// ============================================================================
// Centro de notificaciones (Fase 6.3)
// ============================================================================

export type NotificationType =
  | 'mention'
  | 'reply'
  | 'comment'
  | 'comment_like'
  | 'pub_favorite'
  | 'message'
  | 'sale_closed'
  | 'review_received'
  | 'company_added';

/**
 * Notificación individual del usuario logueado.
 * Backend: `GET /notifications`.
 *
 * Los campos `actor_*` vienen de un JOIN con `customer` y pueden ser null
 * si el actor borró su cuenta (FK ON DELETE SET NULL).
 *
 * `payload` es un JSONB libre con datos específicos por tipo:
 *  - `mention` / `reply` / `comment_like`: `{ snippet: string }`
 *  - `message`: `{ snippet: string }`
 *  - `sale_closed`: `{ pubTitle, surveyToken? }`
 */
export interface AppNotification {
  notif_id: number;
  recipient_cus_id: number;
  actor_cus_id: number | null;
  notif_type: NotificationType;
  pub_id: number | null;
  comment_id: number | null;
  message_id: number | null;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_handle: string | null;
  actor_image: string | null;
}

/** Respuesta de `GET /notifications/unread-count`. */
export interface NotificationsUnreadResponse {
  total: number;
}
