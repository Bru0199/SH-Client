import { useMemo } from "react";
import { useData } from "../../context/DataContext.jsx";
import { formatCurrency } from "../../utils/format.js";

const BAR_WIDTH_CLASSES = {
  0: "w-[0%]",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-[25%]",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-[40%]",
  45: "w-[45%]",
  50: "w-[50%]",
  55: "w-[55%]",
  60: "w-[60%]",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-[75%]",
  80: "w-[80%]",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-[100%]",
};

const getBarWidthClass = (value, total) => {
  const percent = (value / Math.max(total, 1)) * 100;
  const rounded = Math.round(percent / 5) * 5;
  const clamped = Math.min(100, Math.max(0, rounded));
  return BAR_WIDTH_CLASSES[clamped];
};

const AdminDashboardPage = () => {
  const { stats, orders, menuItems, categories, loading, errors } = useData();

  const statusCounts = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      map.set(order.status, (map.get(order.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [orders]);

  const revenueByCategory = useMemo(() => {
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
    const menuMap = new Map(menuItems.map((item) => [item.id, item]));
    const totals = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = menuMap.get(item.menu);
        if (!menuItem) return;
        const categoryId = menuItem.category;
        const categoryName = categoryMap.get(categoryId) || "Unassigned";
        const lineTotal = menuItem.price * item.quantity;
        totals.set(categoryName, (totals.get(categoryName) || 0) + lineTotal);
      });
    });
    return Array.from(totals.entries()).map(([label, value]) => ({
      label,
      value,
    }));
  }, [orders, menuItems, categories]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 min-w-0 w-full overflow-hidden">
      {errors.admin && (
        <div className="alert error shrink-0">{errors.admin}</div>
      )}
      {loading.admin && (
        <div className="alert shrink-0">Loading admin stats...</div>
      )}
      <header className="section-header shrink-0">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Admin dashboard</h1>
          <p className="admin-page-description">
            Overview of your store and orders at a glance.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
        <div className="card stat-card p-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)] m-0 mb-0.5 sm:mb-1">
            Total users
          </h3>
          <p className="text-base sm:text-lg md:text-xl font-bold m-0 text-[var(--text)] tabular-nums">
            {typeof stats.users === "number" ? stats.users : 0}
          </p>
        </div>
        <div className="card stat-card p-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)] m-0 mb-0.5 sm:mb-1">
            Total orders
          </h3>
          <p className="text-base sm:text-lg md:text-xl font-bold m-0 text-[var(--text)] tabular-nums">
            {typeof stats.orders === "number" ? stats.orders : 0}
          </p>
        </div>
        <div className="card stat-card p-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)] m-0 mb-0.5 sm:mb-1">
            Total revenue
          </h3>
          <p
            className="text-base sm:text-lg md:text-xl font-bold m-0 text-[var(--text)] tabular-nums truncate"
            title={formatCurrency(stats.revenue)}
          >
            {formatCurrency(
              typeof stats.revenue === "number" ? stats.revenue : 0,
            )}
          </p>
        </div>
        <div className="card stat-card p-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)] m-0 mb-0.5 sm:mb-1">
            Pending orders
          </h3>
          <p className="text-base sm:text-lg md:text-xl font-bold m-0 text-[var(--text)] tabular-nums">
            {typeof stats.pendingOrders === "number" ? stats.pendingOrders : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mt-2 sm:mt-4 w-full min-w-0">
        <div className="card p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mt-0 mb-2 sm:mb-3">
            Orders by status
          </h3>
          <div className="flex flex-col gap-2 sm:gap-3">
            {statusCounts.map((item) => (
              <div
                key={item.status}
                className="flex flex-col gap-1 sm:grid sm:grid-cols-[120px_1fr_auto] md:grid-cols-[140px_1fr_auto] gap-1.5 sm:gap-2 items-stretch sm:items-center min-w-0"
              >
                <span className="text-[var(--text-muted)] font-semibold text-xs sm:text-sm truncate">
                  {item.status}
                </span>
                <div className="flex items-center gap-2 sm:contents">
                  <div className="rounded-full h-2 sm:h-2.5 md:h-3 bg-[var(--surface-alt)] overflow-hidden min-w-0 flex-1 sm:flex-none">
                    <span
                      className={`block h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] ${getBarWidthClass(item.count, stats.orders)}`}
                    />
                  </div>
                  <strong className="text-xs sm:text-sm text-[var(--text)] tabular-nums shrink-0">
                    {item.count}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--surface)] min-w-0 overflow-hidden">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mt-0 mb-2 sm:mb-3">
            Revenue by category
          </h3>
          <div className="flex flex-col gap-2 sm:gap-3">
            {revenueByCategory.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 sm:grid sm:grid-cols-[120px_1fr_auto] md:grid-cols-[140px_1fr_auto] gap-1.5 sm:gap-2 items-stretch sm:items-center min-w-0"
              >
                <span className="text-[var(--text-muted)] font-semibold text-xs sm:text-sm truncate">
                  {item.label}
                </span>
                <div className="flex items-center gap-2 sm:contents">
                  <div className="rounded-full h-2 sm:h-2.5 md:h-3 bg-[var(--surface-alt)] overflow-hidden min-w-0 flex-1 sm:flex-none">
                    <span
                      className={`block h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] ${getBarWidthClass(item.value, stats.revenue)}`}
                    />
                  </div>
                  <strong
                    className="text-xs sm:text-sm text-[var(--text)] tabular-nums truncate shrink-0"
                    title={formatCurrency(item.value)}
                  >
                    {formatCurrency(item.value)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
