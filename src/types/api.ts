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
 */
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string | null;
  phone: string | null;
  birthday: string | null;
  genid: number | null;
  lang: string | null;
  isAdmin: boolean;
  imagenu: string | null;
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

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isBusiness?: boolean;
  isEmployee?: boolean;
  busId?: number;
  busName?: string;
}

// ============================================================================
// Catálogos
// ============================================================================

/** `GET /cat/countries` devuelve `cou_id, cou_code` (sin label semántico). */
export interface Country {
  cou_id: number;
  cou_code: string;
  cou_description?: string;
}

/** `POST /cat/cities` devuelve `{ value: cit_id, label: cit_description }`. */
export interface CityOption {
  value: number;
  label: string;
}

/** `POST /cat/municipalities` — shape similar a CityOption. */
export interface MunicipalityOption {
  value: number;
  label: string;
}

export interface Gender {
  gen_id: number;
  gen_description: string;
}

export interface PublicationCategory {
  pubgen_id: number;
  pubgen_description: string;
}

export interface PublicationTransaction {
  pubtra_id: number;
  pubtra_description: string;
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
  title: string;
  description: string;
  address: string;
  price: number | string;
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
  pubdet_rooms: number | null;
  pubdet_bathrooms: number | null;
  main_image: string | null;
}

/** Shape de "Mis favoritos" (`GET /myfavorites`). */
export interface FavoriteItem {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number | string;
  rooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  country: string;
  city: string;
  town: string;
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

export interface Comment {
  comment_id: number;
  content: string;
  created_at: string;
  cus_id: number;
  parent_id: number | null;
  cus_first_name: string;
  cus_last_name: string;
}

export interface AddCommentPayload {
  pub_id: number;
  content: string;
  parent_id?: number | null;
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
  imagenu: string | null;
  totalpublis: string | number;
}
export type SellerInfoResponse = SellerInfoRow[];

export interface SellerReview {
  rating_id: number;
  rating_stars: number;
  rating_comment: string;
  buyer_name: string;
  pub_title: string;
  created_at: string;
}

export interface SellerReviewsResponse {
  average: number;
  reviews: SellerReview[];
}

export interface SubmitSurveyPayload {
  token: string;
  stars: number;
  comment: string;
}

export interface CloseSalePayload {
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

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Plan {
  id: number;
  description: string;
  interval: string;
  price: number;
  userLimit: number;
  pubPerUser: number;
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
