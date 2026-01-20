import { View, Text } from 'react-native';

// Mock components para web
export const MapView = ({ children, style, ...props }) => (
  <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', minHeight: 200 }]} {...props}>
    <Text style={{ color: '#666' }}>Mapa no disponible en web</Text>
    {children}
  </View>
);

export const Marker = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Polyline = () => null;
