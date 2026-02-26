import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Wrench, 
  Plus, 
  Search,
  MoreVertical,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

// --- Types ---

type View = 'dashboard' | 'properties' | 'tenants' | 'payments' | 'maintenance';

interface Stats {
  totalProperties: number;
  occupancyRate: number;
  totalRevenue: number;
  openMaintenance: number;
}

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  rent_amount: number;
  status: string;
}

interface Tenant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_name?: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  status: string;
  first_name: string;
  last_name: string;
  property_name: string;
}

interface Maintenance {
  id: number;
  property_name: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-black text-white shadow-lg shadow-black/10" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className, title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) => (
  <div className={cn("bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden", className)}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        {title && <h3 className="font-semibold text-zinc-900">{title}</h3>}
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, trend, trendValue }: { label: string; value: string | number; icon: any; trend?: 'up' | 'down'; trendValue?: string }) => (
  <Card>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            trend === 'up' ? "text-emerald-600" : "text-rose-600"
          )}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600">
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [maintenance, setMaintenance] = React.useState<Maintenance[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, p, t, pay, m] = await Promise.all([
        fetch('/api/stats').then(res => res.json()),
        fetch('/api/properties').then(res => res.json()),
        fetch('/api/tenants').then(res => res.json()),
        fetch('/api/payments').then(res => res.json()),
        fetch('/api/maintenance').then(res => res.json()),
      ]);
      setStats(s);
      setProperties(p);
      setTenants(t);
      setPayments(pay);
      setMaintenance(m);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Properties" 
          value={stats?.totalProperties || 0} 
          icon={Building2} 
          trend="up" 
          trendValue="+2 this month" 
        />
        <StatCard 
          label="Occupancy Rate" 
          value={`${stats?.occupancyRate || 0}%`} 
          icon={Users} 
          trend="up" 
          trendValue="+5% vs last year" 
        />
        <StatCard 
          label="Total Revenue" 
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={CreditCard} 
          trend="up" 
          trendValue="+$1,200 vs last month" 
        />
        <StatCard 
          label="Open Maintenance" 
          value={stats?.openMaintenance || 0} 
          icon={Wrench} 
          trend="down" 
          trendValue="-3 since Monday" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Overview">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', revenue: 4000 },
                { name: 'Feb', revenue: 3000 },
                { name: 'Mar', revenue: 2000 },
                { name: 'Apr', revenue: 2780 },
                { name: 'May', revenue: 1890 },
                { name: 'Jun', revenue: 2390 },
                { name: 'Jul', revenue: 3490 },
              ]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Payments" action={<button className="text-sm font-medium text-zinc-500 hover:text-zinc-900">View All</button>}>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold">
                    {payment.first_name[0]}{payment.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{payment.first_name} {payment.last_name}</p>
                    <p className="text-xs text-zinc-500">{payment.property_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-900">${payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">Properties</h2>
        <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          <Plus size={18} />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id}>
            <Card className="group cursor-pointer hover:border-zinc-300 transition-all">
              <div className="relative h-48 -mx-6 -mt-6 mb-4 bg-zinc-100 overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/800/600`} 
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className={cn(
                "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm",
                property.status === 'Occupied' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
              )}>
                {property.status}
              </div>
            </div>
            <h3 className="font-bold text-lg text-zinc-900 mb-1">{property.name}</h3>
            <p className="text-sm text-zinc-500 mb-4">{property.address}</p>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Monthly Rent</p>
                <p className="text-lg font-bold text-zinc-900">${property.rent_amount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Type</p>
                <p className="text-sm font-medium text-zinc-600">{property.type}</p>
              </div>
            </div>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTenants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">Tenants</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            <Plus size={18} />
            Add Tenant
          </button>
        </div>
      </div>

      <Card className="p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold">
                      {tenant.first_name[0]}{tenant.last_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{tenant.first_name} {tenant.last_name}</p>
                      <p className="text-xs text-zinc-500">ID: #{tenant.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-zinc-900">{tenant.email}</p>
                  <p className="text-xs text-zinc-500">{tenant.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-900">{tenant.property_name || 'Unassigned'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-400 hover:text-zinc-900">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">Maintenance</h2>
        <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          <Plus size={18} />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {maintenance.map((issue) => (
          <div key={issue.id}>
            <Card className="hover:border-zinc-300 transition-all">
              <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  issue.status === 'Open' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {issue.status === 'Open' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-zinc-900">{issue.property_name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      issue.priority === 'High' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {issue.priority} Priority
                    </span>
                  </div>
                  <p className="text-zinc-600 mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> Reported {format(new Date(issue.created_at), 'MMM d, h:mm a')}</span>
                    <span className="flex items-center gap-1"><AlertCircle size={12} /> Status: {issue.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                  Assign
                </button>
                <button className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors">
                  Resolve
                </button>
              </div>
            </div>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-100 p-6 flex flex-col fixed h-full">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <Building2 size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">RentFlow</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <SidebarItem 
            icon={Building2} 
            label="Properties" 
            active={currentView === 'properties'} 
            onClick={() => setCurrentView('properties')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Tenants" 
            active={currentView === 'tenants'} 
            onClick={() => setCurrentView('tenants')} 
          />
          <SidebarItem 
            icon={CreditCard} 
            label="Payments" 
            active={currentView === 'payments'} 
            onClick={() => setCurrentView('payments')} 
          />
          <SidebarItem 
            icon={Wrench} 
            label="Maintenance" 
            active={currentView === 'maintenance'} 
            onClick={() => setCurrentView('maintenance')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold">
              AD
            </div>
            <div>
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-zinc-500">Property Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h2>
            <p className="text-zinc-500 mt-1">
              Welcome back, here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all w-64"
              />
            </div>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <Clock size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'properties' && renderProperties()}
                {currentView === 'tenants' && renderTenants()}
                {currentView === 'maintenance' && renderMaintenance()}
                {currentView === 'payments' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-zinc-900">Payments</h2>
                      <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                        <Plus size={18} />
                        Record Payment
                      </button>
                    </div>
                    <Card className="p-0">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-zinc-100">
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Tenant</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-zinc-900">{payment.first_name} {payment.last_name}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-zinc-600">{payment.property_name}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-zinc-900">${payment.amount.toLocaleString()}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-zinc-500">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
