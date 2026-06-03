/**
 * Fase 19 — coordenadas aproximadas de municipios y ciudades de Guatemala.
 *
 * Mapa nombre-normalizado → [lat, lng] del centroide aproximado.
 * Usado por el mapa de propiedades cuando el backend aún no tiene
 * lat/lng por publicación (Fase 19.1 lo solucionará). Cada publicación
 * se ubica por el centroide del municipio / ciudad que indicó el
 * propietario.
 *
 * Si el municipio no está en este diccionario, caemos al centroide del
 * departamento; si tampoco, al centro de Guatemala. Eso hace que el pin
 * aparezca aunque sea con menor precisión — preferible a esconder la
 * propiedad del mapa.
 *
 * Precisión: ±2-5 km, suficiente para descubrimiento. Para visitas y
 * negociación, el usuario navega al detalle donde está la dirección.
 *
 * Normalización: minúsculas, sin tildes, sin "departamento de", "ciudad
 * de", "zona X" — para que "Ciudad de Guatemala", "Guatemala",
 * "guatemala ciudad" todos resuelvan a la misma entrada.
 */

const COORDS: Record<string, [number, number]> = {
  // Departamento Guatemala
  guatemala: [14.6349, -90.5069],
  mixco: [14.633, -90.6068],
  villanueva: [14.5266, -90.5878],
  'villa nueva': [14.5266, -90.5878],
  petapa: [14.5004, -90.5562],
  'san jose pinula': [14.5444, -90.4232],
  amatitlan: [14.4793, -90.6147],
  chinautla: [14.7117, -90.5036],
  // Departamento Sacatepéquez
  antigua: [14.5586, -90.7339],
  'antigua guatemala': [14.5586, -90.7339],
  jocotenango: [14.5719, -90.7392],
  'ciudad vieja': [14.5167, -90.7667],
  // Departamento Quetzaltenango
  quetzaltenango: [14.8333, -91.5167],
  xela: [14.8333, -91.5167],
  // Departamento Sololá
  solola: [14.7717, -91.1839],
  panajachel: [14.7444, -91.1556],
  // Departamento Chimaltenango
  chimaltenango: [14.6606, -90.8197],
  // Departamento Escuintla
  escuintla: [14.305, -90.7853],
  // Departamento Suchitepéquez
  mazatenango: [14.5347, -91.5022],
  // Departamento Retalhuleu
  retalhuleu: [14.5358, -91.6783],
  // Departamento San Marcos
  'san marcos': [14.9667, -91.7944],
  // Departamento Huehuetenango
  huehuetenango: [15.3194, -91.4708],
  // Departamento Quiché
  'santa cruz del quiche': [15.0303, -91.15],
  // Departamento Baja Verapaz
  salama: [15.1019, -90.3169],
  // Departamento Alta Verapaz
  coban: [15.4708, -90.3789],
  // Departamento Petén
  flores: [16.9286, -89.8917],
  // Departamento Izabal
  'puerto barrios': [15.7244, -88.5942],
  // Departamento Zacapa
  zacapa: [14.9714, -89.5306],
  // Departamento Chiquimula
  chiquimula: [14.8, -89.5444],
  // Departamento Jalapa
  jalapa: [14.6333, -89.9833],
  // Departamento Jutiapa
  jutiapa: [14.2917, -89.8956],
  // Departamento Santa Rosa
  cuilapa: [14.2783, -90.2964],
  // Departamento El Progreso
  guastatoya: [14.8531, -90.0697],
  // Departamento Totonicapán
  totonicapan: [14.9117, -91.3608],
};

// Fallback: centro geográfico aproximado de Guatemala.
export const GUATEMALA_CENTER: [number, number] = [15.5, -90.25];

/**
 * Normaliza una cadena para lookup en COORDS:
 *  - lowercase
 *  - quita tildes
 *  - quita prefijos comunes ("ciudad de", "departamento de", etc.)
 *  - trim de espacios
 */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')        // quita diacríticos
    .replace(/^ciudad de\s+/, '')
    .replace(/^departamento de\s+/, '')
    .replace(/^municipio de\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Devuelve las coords más precisas que encontró para una publicación.
 * Prioridad: municipio → ciudad → país → fallback (centro GT).
 *
 * `country`/`city`/`town` vienen como string del backend
 * (cat_country.cou_description, cat_city.cit_description,
 *  cat_town.tow_description).
 */
export function getCoordsFromLocation(
  country: string | null | undefined,
  city: string | null | undefined,
  town: string | null | undefined,
): [number, number] {
  // Buscar por municipio primero (más preciso).
  if (town) {
    const key = normalize(town);
    if (COORDS[key]) return COORDS[key];
  }
  // Luego por ciudad.
  if (city) {
    const key = normalize(city);
    if (COORDS[key]) return COORDS[key];
  }
  // Si solo tenemos país, y es Guatemala, fallback al centro.
  // Si el país es otro (no soportado aún), también fallback al centro
  // GT — al menos el pin aparece en algún lado y el usuario ve la
  // publicación en la lista.
  return GUATEMALA_CENTER;
}

/**
 * Agrupa publicaciones por coords exactas (cluster). Útil cuando varias
 * propiedades caen en el mismo municipio: en vez de pintar N pins
 * encima, pintamos uno con badge "N".
 *
 * Devuelve `Array<{ coords, items }>` donde items es el array de
 * publicaciones del grupo.
 */
export function clusterByCoords<T extends { __coords: [number, number] }>(
  items: T[],
): Array<{ coords: [number, number]; items: T[] }> {
  const groups = new Map<string, { coords: [number, number]; items: T[] }>();
  for (const item of items) {
    const key = `${item.__coords[0].toFixed(4)},${item.__coords[1].toFixed(4)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { coords: item.__coords, items: [item] });
    }
  }
  return Array.from(groups.values());
}
