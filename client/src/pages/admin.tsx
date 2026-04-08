import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Image,
  DollarSign,
  TrendingUp,
  LogOut,
  Loader2,
  Search,
  Star,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function LensLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="LensParty logo">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="16" r="8" fill="hsl(262 83% 58%)" opacity="0.15"/>
      <circle cx="16" cy="16" r="5" fill="hsl(262 83% 58%)"/>
      <circle cx="16" cy="16" r="2.5" fill="white"/>
      <circle cx="21" cy="11" r="1.5" fill="hsl(330 80% 60%)"/>
    </svg>
  );
}

type AdminUser = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  isAdmin: number;
  eventCount: number;
  paidEventCount: number;
  totalSpent: number;
};

type AdminEvent = {
  id: number;
  name: string;
  eventType: string;
  code: string;
  plan: string;
  photoCount: number;
  paidAt: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  hostEmail: string | null;
  hostName: string | null;
  isDemo: number;
};

type Stats = {
  totalUsers: number;
  totalEvents: number;
  totalPhotos: number;
  totalRevenue: number;
  paidEvents: number;
  freeEvents: number;
  demoEvents: number;
  newUsersThisMonth: number;
  newEventsThisMonth: number;
  revenueThisMonth: number;
};

type RevenueData = {
  monthly: { month: string; revenue: number; count: number }[];
  byPlan: Record<string, { count: number; revenue: number }>;
  recent: { id: number; eventName: string; plan: string; amount: number; paidAt: string; hostEmail: string }[];
};

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "events", label: "Events", icon: Calendar },
  { key: "revenue", label: "Revenue", icon: CreditCard },
] as const;

type Tab = typeof tabs[number]["key"];

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    business: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${colors[plan] || colors.free}`}>
      {plan}
    </span>
  );
}

function OverviewTab({ stats }: { stats: Stats }) {
  const { data: eventsData } = useQuery<{ events: AdminEvent[] }>({
    queryKey: ["/api/admin/events?page=1"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const recentEvents = eventsData?.events?.slice(0, 5) || [];
  const recentSales = revenueData?.recent?.slice(0, 5) || [];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={UserCheck} label="Total Users" value={stats.totalUsers.toLocaleString()} color="bg-blue-500" />
        <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents.toLocaleString()} color="bg-purple-500" sub={`${stats.demoEvents} demo`} />
        <StatCard icon={Image} label="Total Photos" value={stats.totalPhotos.toLocaleString()} color="bg-green-500" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="bg-yellow-500" sub={`${stats.paidEvents} paid events`} />
        <StatCard icon={TrendingUp} label="Events This Month" value={stats.newEventsThisMonth} color="bg-teal-500" sub={`${stats.newUsersThisMonth} new users`} />
        <StatCard icon={TrendingUp} label="Revenue This Month" value={`$${stats.revenueThisMonth.toLocaleString()}`} color="bg-orange-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-bold text-base text-foreground mb-4">Recent Events</h3>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentEvents.map(e => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-foreground font-medium truncate">{e.name}</span>
                    <PlanBadge plan={e.isDemo ? "demo" : e.plan} />
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{new Date(e.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-bold text-base text-foreground mb-4">Recent Sales</h3>
          {recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentSales.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-foreground font-medium truncate">{s.eventName}</span>
                    <PlanBadge plan={s.plan} />
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">${s.amount}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.paidAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ users: AdminUser[]; total: number; page: number; pages: number }>({
    queryKey: [`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: number; isAdmin: number }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users`] });
      // Also invalidate with search params
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string)?.startsWith?.("/api/admin/users") });
      toast({ title: "User updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
            data-testid="input-admin-search-users"
          />
        </div>
        <span className="text-sm text-muted-foreground">{data?.total || 0} users</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-admin-users">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Events</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Spent</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Admin</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></td></tr>
              ) : !data?.users?.length ? (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                data.users.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        {u.name}
                        {u.isAdmin === 1 && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">{u.eventCount}</td>
                    <td className="py-3 px-4 text-center">{u.totalSpent > 0 ? `$${u.totalSpent}` : "—"}</td>
                    <td className="py-3 px-4 text-center">
                      {u.isAdmin === 1 ? <span className="text-yellow-600 text-xs font-semibold">Admin</span> : <span className="text-muted-foreground text-xs">No</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => toggleAdminMutation.mutate({ id: u.id, isAdmin: u.isAdmin === 1 ? 0 : 1 })}
                        disabled={toggleAdminMutation.isPending}
                        data-testid={`button-toggle-admin-${u.id}`}
                      >
                        {u.isAdmin === 1 ? "Remove Admin" : "Make Admin"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {data.pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} data-testid="button-users-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages} data-testid="button-users-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventsTab() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const { data, isLoading } = useQuery<{ events: AdminEvent[]; total: number; page: number; pages: number }>({
    queryKey: [`/api/admin/events?page=${page}&search=${encodeURIComponent(search)}&plan=${planFilter}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string)?.startsWith?.("/api/admin/") });
      toast({ title: "Event deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "free", label: "Free" },
    { key: "pro", label: "Pro" },
    { key: "business", label: "Business" },
    { key: "demo", label: "Demo" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
            data-testid="input-admin-search-events"
          />
        </div>
        <div className="flex gap-1">
          {filterTabs.map(f => (
            <button
              key={f.key}
              onClick={() => { setPlanFilter(f.key); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${planFilter === f.key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">{data?.total || 0} events</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-admin-events">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Event Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Host</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Plan</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Photos</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></td></tr>
              ) : !data?.events?.length ? (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No events found.</td></tr>
              ) : (
                data.events.map(e => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[200px]">{e.name}</span>
                        {e.isDemo === 1 && <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-1.5 py-0.5 rounded-full font-semibold">Demo</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">{e.eventType}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{e.hostEmail || e.hostName || "—"}</td>
                    <td className="py-3 px-4 text-center"><PlanBadge plan={e.plan} /></td>
                    <td className="py-3 px-4 text-center">{e.photoCount}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <a href={`/#/event/${e.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-view-event-${e.id}`}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => { if (confirm(`Delete "${e.name}"?`)) deleteMutation.mutate(e.id); }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-event-${e.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {data.pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} data-testid="button-events-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages} data-testid="button-events-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueTab() {
  const { data, isLoading } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!data) return null;

  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div>
      {/* Big number */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="text-sm font-medium text-white/70 mb-1">Total Revenue</div>
        <div className="font-display font-bold text-4xl">${totalRevenue.toLocaleString()}</div>
        <div className="text-sm text-white/60 mt-1">{stats?.paidEvents || 0} paid events</div>
      </div>

      {/* Monthly chart */}
      {data.monthly.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h3 className="font-display font-bold text-base text-foreground mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue by plan */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <PlanBadge plan="pro" />
            <span className="font-display font-bold text-foreground">Pro Plan</span>
          </div>
          <div className="font-display font-bold text-2xl text-foreground">${data.byPlan.pro?.revenue?.toLocaleString() || 0}</div>
          <div className="text-xs text-muted-foreground">{data.byPlan.pro?.count || 0} events</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <PlanBadge plan="business" />
            <span className="font-display font-bold text-foreground">Business Plan</span>
          </div>
          <div className="font-display font-bold text-2xl text-foreground">${data.byPlan.business?.revenue?.toLocaleString() || 0}</div>
          <div className="text-xs text-muted-foreground">{data.byPlan.business?.count || 0} events</div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-base text-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-admin-revenue">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Event</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Plan</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Host</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No transactions yet.</td></tr>
              ) : (
                data.recent.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground truncate max-w-[200px]">{r.eventName}</td>
                    <td className="py-3 px-4 text-center"><PlanBadge plan={r.plan} /></td>
                    <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">${r.amount}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(r.paidAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{r.hostEmail || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<{ id: number; email: string; name: string; eventsCount: number; isAdmin: number } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.isAdmin === 1,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/auth/logout"); },
    onSuccess: () => { queryClient.clear(); navigate("/login"); },
    onError: (e: any) => toast({ title: "Logout failed", description: e.message, variant: "destructive" }),
  });

  // Loading
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  // Not admin
  if (user.isAdmin !== 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">You don't have admin privileges to access this page.</p>
          <Link href="/">
            <Button variant="outline" data-testid="button-admin-go-home">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap'); .font-display { font-family: 'Clash Display', 'Satoshi', sans-serif; }`}</style>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border flex-shrink-0">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-admin-home">
              <LensLogo size={22} />
              <span className="font-display font-bold text-base text-foreground">LensParty</span>
            </div>
          </Link>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full ml-1">ADMIN</span>
          <button className="lg:hidden ml-auto text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1" data-testid="nav-admin-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`tab-${tab.key}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate mb-3">{user.email}</div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-admin-logout"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-16 border-b border-border flex items-center px-6 gap-3 lg:hidden flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} data-testid="button-admin-menu">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-display font-bold text-base text-foreground">Admin</span>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-foreground capitalize">{activeTab}</h1>
            </div>

            {activeTab === "overview" && (
              statsLoading || !stats ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <OverviewTab stats={stats} />
              )
            )}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "events" && <EventsTab />}
            {activeTab === "revenue" && <RevenueTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
