import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, BarChart3, Bot, Search } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #13131f 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1f1f35' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-gray-100" />
              <h1 className="text-2xl font-bold text-white">
                Estatify
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-800 text-white border border-gray-700'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={!isActive ? { ':hover': { background: '#1a1a2e' } } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16" style={{ background: 'rgba(15, 15, 26, 0.5)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1f1f35' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Estatify - Smart Real Estate Investment Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

