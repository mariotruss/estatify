import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PropertyMap({ properties, zoom = 6 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (Germany)
    const defaultCenter = [51.1657, 10.4515];
    
    // Initialize map
    const map = L.map(mapRef.current).setView(defaultCenter, zoom);
    mapInstanceRef.current = map;

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !properties || properties.length === 0) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for properties
    const bounds = [];
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const marker = L.marker([property.latitude, property.longitude]).addTo(map);
        
        const popupContent = `
          <div style="color: #000; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${property.title}</h3>
            <p style="margin: 4px 0;"><strong>Preis:</strong> €${property.price.toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>Größe:</strong> ${property.size}m²</p>
            <p style="margin: 4px 0;"><strong>ROI:</strong> ${property.roi?.toFixed(2) || 'N/A'}%</p>
            <p style="margin: 4px 0;"><strong>Stadt:</strong> ${property.city}</p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        bounds.push([property.latitude, property.longitude]);
      }
    });

    // Fit map to bounds if we have properties
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />;
}

