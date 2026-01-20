// Importar react-native-maps directamente
// Metro resolverá esto a maps.web.js en web gracias a la configuración
const Maps = require('react-native-maps');

export const MapView = Maps.default || Maps;
export const Marker = Maps.Marker;
export const Polyline = Maps.Polyline;
