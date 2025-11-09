import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, TrendingUp, Percent, Euro, Maximize2, Filter } from 'lucide-react';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    minRoi: '',
    propertyType: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/properties?${queryParams}`);
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handleApplyFilters() {
    setLoading(true);
    fetchProperties();
  }

  function handleResetFilters() {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      minRoi: '',
      propertyType: '',
    });
    setLoading(true);
    setTimeout(() => fetchProperties(), 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Property Overview</h1>
        <div className="text-gray-400">
          {properties.length} properties found
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
            className="input"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min. Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="input"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max. Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="input"
          />
          <input
            type="number"
            name="minRoi"
            placeholder="Min. ROI %"
            value={filters.minRoi}
            onChange={handleFilterChange}
            className="input"
          />
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleFilterChange}
            className="input"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
          </select>
        </div>
        <div className="flex space-x-4 mt-4">
          <button onClick={handleApplyFilters} className="btn-primary">
            Apply Filters
          </button>
          <button onClick={handleResetFilters} className="btn-secondary">
            Reset
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No properties found</h3>
          <p className="text-gray-500">Try different filters or load new data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }) {
  return (
    <Link to={`/properties/${property.id}`} className="card overflow-hidden hover:border-gray-600 transition-all group">
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        <img
          src={property.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg border border-gray-700">
          {property.propertyType}
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-gray-200 transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #1f1f35' }}>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              €{Math.round(property.price / 1000)}k
            </div>
            <div className="text-xs text-gray-500">Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {property.roi?.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">ROI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {property.size}m²
            </div>
            <div className="text-xs text-gray-500">Size</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <div className="flex items-center text-gray-500">
            <Percent className="h-4 w-4 mr-1" />
            <span>{property.rentalYield?.toFixed(2)}% Yield</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Euro className="h-4 w-4 mr-1" />
            <span>{Math.round(property.pricePerSqm)}/m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

