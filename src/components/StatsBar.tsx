import { RevenueReport } from '@/lib/types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

function StatCard({ label, value, icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}

interface StatsBarProps {
  stats: RevenueReport;
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <StatCard
        label="Total Leads"
        value={stats.totalLeads.toLocaleString()}
        icon="👥"
        trend="up"
        trendValue="12%"
      />
      <StatCard
        label="Qualified Leads"
        value={stats.qualifiedLeads.toLocaleString()}
        icon="✓"
        trend="up"
        trendValue="8%"
      />
      <StatCard
        label="Conversion Rate"
        value={`${(stats.conversionRate * 100).toFixed(1)}%`}
        icon="📈"
        trend="up"
        trendValue="3.2%"
      />
      <StatCard
        label="Cost per Lead"
        value={`$${stats.costPerLead.toFixed(2)}`}
        icon="💰"
        trend="down"
        trendValue="5%"
      />
      <StatCard
        label="Cost per Case"
        value={`$${stats.costPerCase.toLocaleString()}`}
        icon="💼"
        trend="down"
        trendValue="2%"
      />
      <StatCard
        label="ROI Multiple"
        value={`${stats.roiMultiple.toFixed(1)}x`}
        icon="🚀"
        trend="up"
        trendValue="15%"
      />
    </div>
  );
}
