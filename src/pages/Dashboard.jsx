import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Building2, DollarSign, Percent, MapPin, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import PropertyMap from '../components/PropertyMap';
import RecentProperties from '../components/RecentProperties';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, propertiesRes] = await Promise.all([
        fetch('/api/properties/stats/overview'),
        fetch('/api/properties?limit=10')
      ]);

      const statsData = await statsRes.json();
      const propertiesData = await propertiesRes.json();

      setStats(statsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchProperties() {
    try {
      setLoading(true);
      const cities = ['Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln'];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      await fetch('/api/properties/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'all', city: randomCity }),
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Smart Real Estate Investment Platform
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Analyze properties from various data sources and make data-driven investment decisions
        </p>
        <button 
          onClick={handleFetchProperties}
          disabled={loading}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>{loading ? 'Loading...' : 'Load New Properties'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon={Building2}
          color="text-gray-300"
        />
        <StatCard
          title="Avg Price"
          value={`€${Math.round(stats?.avgPrice || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-500"
        />
        <StatCard
          title="Avg ROI"
          value={`${(stats?.avgRoi || 0).toFixed(2)}%`}
          icon={TrendingUp}
          color="text-emerald-400"
        />
        <StatCard
          title="Avg Rental Yield"
          value={`${(stats?.avgRentalYield || 0).toFixed(2)}%`}
          icon={Percent}
          color="text-cyan-400"
        />
      </div>

      {/* Map */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-gray-300" />
            <h2 className="text-2xl font-bold">Property Locations</h2>
          </div>
          <Link to="/properties" className="text-gray-400 hover:text-gray-200 font-medium transition-colors">
            View all →
          </Link>
        </div>
        <PropertyMap properties={properties} />
      </div>

      {/* Recent Properties */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Properties</h2>
          <Link to="/properties" className="text-gray-400 hover:text-gray-200 font-medium transition-colors">
            View all →
          </Link>
        </div>
        <RecentProperties properties={properties.slice(0, 6)} />
      </div>
    </div>
  );
}

