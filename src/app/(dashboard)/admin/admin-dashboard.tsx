"use client";

import * as React from "react";
import { Users, CreditCard, DollarSign, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  mrr: number;
  totalDocuments: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  subscription: {
    planId: string;
    status: string;
    billingInterval: string;
    currentPeriodEnd: string | null;
  } | null;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  billingInterval: string;
  isEarlyBird: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  stripeSubscriptionId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
}

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  amountDue: number;
  currency: string;
  status: string | null;
  paid: boolean;
  customerEmail: string | null;
  customerName: string | null;
  subscriptionId: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string | null;
  paidAt: string | null;
}

const ITEMS_PER_PAGE = 10;

export function AdminDashboard() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState("overview");

  // Fetch stats
  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  // Fetch users when users tab is active
  React.useEffect(() => {
    if (activeTab !== "users") return;

    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/users?limit=100");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [activeTab]);

  // Fetch subscriptions when subscriptions tab is active
  React.useEffect(() => {
    if (activeTab !== "subscriptions") return;

    async function fetchSubscriptions() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/subscriptions?limit=100");
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data.subscriptions || []);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscriptions();
  }, [activeTab]);

  // Fetch invoices when revenue tab is active
  React.useEffect(() => {
    if (activeTab !== "revenue") return;

    async function fetchInvoices() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/invoices?limit=100");
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices || []);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [activeTab]);

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Pagination for users
  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="Registered accounts"
        />
        <StatsCard
          title="Paid Users"
          value={stats?.paidUsers ?? 0}
          icon={CreditCard}
          description="Active subscribers"
        />
        <StatsCard
          title="MRR"
          value={
            stats?.mrr ? `$${(stats.mrr / 100).toLocaleString()}` : "$0"
          }
          icon={DollarSign}
          description="Monthly recurring revenue"
        />
        <StatsCard
          title="Documents"
          value={stats?.totalDocuments ?? 0}
          icon={FileText}
          description="Total documents created"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-medium">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Paid Users</span>
                  <span className="font-medium">{stats?.paidUsers ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">
                    {stats?.totalUsers
                      ? `${((stats.paidUsers / stats.totalUsers) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Total Documents</span>
                  <span className="font-medium">{stats?.totalDocuments ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">MRR</span>
                  <span className="font-medium">
                    {stats?.mrr ? `$${(stats.mrr / 100).toLocaleString()}` : "$0"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">ARR</span>
                  <span className="font-medium">
                    {stats?.mrr
                      ? `$${((stats.mrr * 12) / 100).toLocaleString()}`
                      : "$0"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">ARPU</span>
                  <span className="font-medium">
                    {stats?.paidUsers && stats?.mrr
                      ? `$${(stats.mrr / stats.paidUsers / 100).toFixed(2)}`
                      : "$0"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No users found" : "No users yet"}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || "—"}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                user.subscription?.status === "active"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {user.subscription?.status || "free"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
                        {filteredUsers.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading subscriptions...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">No subscriptions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {sub.user?.name || sub.organization?.name || "—"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {sub.user?.email || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{sub.planId}</TableCell>
                        <TableCell className="capitalize">{sub.billingInterval}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              sub.status === "active"
                                ? "bg-green-50 text-green-700"
                                : sub.status === "canceled"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab - Stripe Invoices */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">No invoices yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium font-mono text-xs">
                          {invoice.number || invoice.id.slice(0, 12)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {invoice.customerName || "—"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {invoice.customerEmail || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              invoice.paid
                                ? "bg-green-50 text-green-700"
                                : invoice.status === "open"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {invoice.paid ? "paid" : invoice.status || "draft"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {invoice.paidAt
                            ? new Date(invoice.paidAt).toLocaleDateString()
                            : invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {invoice.hostedInvoiceUrl && (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
