import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Euro, Maximize2 } from 'lucide-react';

export default function RecentProperties({ properties }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No properties available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/properties/${property.id}`}
          className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-primary-600 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
              {property.title}
            </h3>
            <span className="bg-primary-900 text-primary-400 text-xs px-2 py-0.5 rounded-full ml-2 shrink-0">
              {property.propertyType}
            </span>
          </div>

          <div className="flex items-center text-gray-400 text-xs mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{property.city}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                €{Math.round(property.price / 1000)}k
              </div>
              <div className="text-gray-400">Price</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">
                {property.roi?.toFixed(1)}%
              </div>
              <div className="text-gray-400">ROI</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent-500">
                {property.size}m²
              </div>
              <div className="text-gray-400">Size</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

