import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Building2 } from 'lucide-react';

const COLORS = ['#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [marketOverview, setMarketOverview] = useState(null);
  const [priceTrends, setPriceTrends] = useState([]);
  const [roiDistribution, setRoiDistribution] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cityComparison, setCityComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const [overviewRes, trendsRes, roiRes, typesRes, cityRes] = await Promise.all([
        fetch('/api/analytics/market-overview'),
        fetch('/api/analytics/price-trends'),
        fetch('/api/analytics/roi-distribution'),
        fetch('/api/analytics/property-types'),
        fetch('/api/analytics/city-comparison')
      ]);

      setMarketOverview(await overviewRes.json());
      setPriceTrends(await trendsRes.json());
      setRoiDistribution(await roiRes.json());
      setPropertyTypes(await typesRes.json());
      setCityComparison(await cityRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Market Analysis & Statistics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Properties</p>
              <p className="text-3xl font-bold mt-1">{marketOverview?.totalProperties || 0}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Price</p>
              <p className="text-3xl font-bold mt-1">
                €{Math.round(marketOverview?.avgPrice || 0).toLocaleString('en-US')}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-accent-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg ROI</p>
              <p className="text-3xl font-bold mt-1 text-green-500">
                {(marketOverview?.avgRoi || 0).toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Yield</p>
              <p className="text-3xl font-bold mt-1 text-purple-500">
                {(marketOverview?.avgRentalYield || 0).toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends by City */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Average Prices by City</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="city" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Bar dataKey="avgPrice" fill="#d946ef" name="Avg Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROI Distribution */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">ROI Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roiDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ roiRange, percent }) => `${roiRange} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="roiRange"
              >
                {roiDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Property Types */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Property Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="propertyType" type="category" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* City Comparison */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">City Comparison (ROI)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cityComparison.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="city" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avgRoi" stroke="#10b981" strokeWidth={2} name="Avg ROI %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Ranges */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Price Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {marketOverview?.priceRanges?.map((range, idx) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-primary-500">{range.count}</div>
              <div className="text-sm text-gray-400 mt-1">{range.priceRange}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-primary-500" />
          Top Cities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {marketOverview?.topCities?.map((city, idx) => (
            <div key={idx} className="bg-gradient-to-br from-primary-900 to-accent-900 rounded-lg p-4 border border-primary-700">
              <div className="text-3xl font-bold">{city.count}</div>
              <div className="text-sm text-gray-300 mt-1">{city.city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

