export default function StatCard({ title, value, icon: Icon, color = 'text-primary-500' }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color} opacity-80`}>
          <Icon className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}

