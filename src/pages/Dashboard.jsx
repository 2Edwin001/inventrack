import { useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { useDashboardStats } from '../hooks/useDashboardStats'
import { useItemsPorSede } from '../hooks/useItemsPorSede'
import { useItemsPorCategoria } from '../hooks/useItemsPorCategoria'
import { useUltimosMovimientos } from '../hooks/useUltimosMovimientos'
import { useAlertasStock } from '../hooks/useAlertasStock'
import { useAlerts } from '../context/AlertContext'

import Card from '../components/Card'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Table from '../components/Table'

// ─── Constantes ──────────────────────────────────────────────

const PIE_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
]

// ─── Helpers ─────────────────────────────────────────────────

const formatMoney = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

const formatDate = (d) =>
  new Date(d).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

// ─── Iconos SVG ──────────────────────────────────────────────

const IconPackage = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
)

const IconMoney = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
)

const IconAlert = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const IconBuilding = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

// ─── Stat Card ────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color, bg, loading }) {
  if (loading) {
    return (
      <div className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" />
          <div className="h-7 w-14 rounded bg-gray-100 dark:bg-gray-700" />
          <div className="h-2.5 w-28 rounded bg-gray-100 dark:bg-gray-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="truncate text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Tooltip del gráfico de barras ───────────────────────────

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1 font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="text-indigo-600 dark:text-indigo-400">
        {payload[0].value} productos
      </p>
    </div>
  )
}

// ─── Tooltip del gráfico de dona ─────────────────────────────

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="font-semibold" style={{ color: entry.payload.fill }}>
        {entry.name}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        {entry.value} productos
      </p>
    </div>
  )
}

// ─── Gráfico de barras: items por sede ───────────────────────

function BarChartSede({ data, loading, error }) {
  return (
    <Card title="Productos por sede">
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
      {!loading && error && (
        <p className="py-8 text-center text-sm text-red-500">{error}</p>
      )}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          title="Sin datos"
          description="Agrega productos asociados a sedes para ver este gráfico."
        />
      )}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
            <XAxis
              dataKey="sede"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar
              dataKey="cantidad"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              maxBarSize={72}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ─── Gráfico de dona: items por categoría ────────────────────

function DonutCategoria({ data, loading, error }) {
  return (
    <Card title="Distribución por categoría">
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
      {!loading && error && (
        <p className="py-8 text-center text-sm text-red-500">{error}</p>
      )}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          title="Sin datos"
          description="Agrega productos con categoría para ver este gráfico."
        />
      )}
      {!loading && !error && data.length > 0 && (
        <div className="flex flex-col gap-3">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Leyenda */}
          <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {data.map((entry, i) => (
              <li key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate text-gray-600 dark:text-gray-400">
                    {entry.name}
                  </span>
                </div>
                <span className="ml-2 shrink-0 font-semibold text-gray-900 dark:text-white">
                  {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

// ─── Tabla: últimos movimientos ───────────────────────────────

const MOV_COLS = [
  {
    key: 'fecha',
    header: 'Fecha',
    render: (val) => (
      <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
        {formatDate(val)}
      </span>
    ),
  },
  {
    key: 'items',
    header: 'Producto',
    render: (val) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900 dark:text-white">
          {val?.nombre ?? '—'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{val?.codigo}</p>
      </div>
    ),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (val) => (
      <Badge variant={val === 'ENTRADA' ? 'green' : 'yellow'}>{val}</Badge>
    ),
  },
  {
    key: 'cantidad',
    header: 'Cant.',
    render: (val) => (
      <span className="font-medium text-gray-900 dark:text-white">{val}</span>
    ),
  },
  {
    key: 'motivo',
    header: 'Motivo',
    render: (val) =>
      val ? (
        <span className="text-gray-700 dark:text-gray-300">{val}</span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
]

function MovimientosSection({ data, loading, error }) {
  return (
    <Card title="Últimos movimientos">
      {error && (
        <p className="mb-4 text-sm text-red-500">{error}</p>
      )}
      <Table
        columns={MOV_COLS}
        data={data}
        loading={loading}
        pageSize={10}
        emptyTitle="Sin movimientos"
        emptyDescription="Aquí aparecerán las entradas y salidas del inventario."
      />
    </Card>
  )
}

// ─── Lista: alertas de stock ──────────────────────────────────

function AlertasSection({ data, loading, error }) {
  return (
    <Card
      title="Alertas de stock"
      action={
        !loading && data.length > 0 ? (
          <Badge variant="red">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {data.length}
          </Badge>
        ) : null
      }
    >
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          title="Sin alertas"
          description="Todos los productos tienen stock suficiente."
          icon={
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      )}

      {!loading && !error && data.length > 0 && (
        <ul className="max-h-[26rem] divide-y divide-gray-50 overflow-y-auto dark:divide-gray-700/40">
          {data.map((item) => {
            const porcentaje = item.stock_minimo > 0
              ? Math.round((item.stock / item.stock_minimo) * 100)
              : 0
            const variant = porcentaje === 0 ? 'red' : porcentaje < 50 ? 'red' : 'yellow'

            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                {/* Indicador */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.codigo}
                    {item.sedes?.nombre ? ` · ${item.sedes.nombre}` : ''}
                  </p>
                </div>

                {/* Stock */}
                <div className="shrink-0 text-right">
                  <Badge variant={variant}>
                    {item.stock} / {item.stock_minimo}
                  </Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

// ─── Dashboard principal ──────────────────────────────────────

export default function Dashboard() {
  const stats = useDashboardStats()
  const porSede = useItemsPorSede()
  const porCategoria = useItemsPorCategoria()
  const movimientos = useUltimosMovimientos()
  const alertas = useAlertasStock()
  const { setAlertCount } = useAlerts()

  useEffect(() => {
    setAlertCount(alertas.data.length)
    return () => setAlertCount(0)
  }, [alertas.data.length, setAlertCount])

  const statCards = [
    {
      label: 'Total productos',
      value: stats.loading ? '—' : stats.data?.totalItems ?? 0,
      sub: 'en inventario',
      icon: <IconPackage />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      label: 'Valor del inventario',
      value: stats.loading ? '—' : formatMoney(stats.data?.valorTotal),
      sub: 'precio × stock',
      icon: <IconMoney />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Stock crítico',
      value: stats.loading ? '—' : stats.data?.stockCritico ?? 0,
      sub: 'bajo el mínimo',
      icon: <IconAlert />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Sedes activas',
      value: stats.loading ? '—' : stats.data?.totalSedes ?? 0,
      sub: 'en operación',
      icon: <IconBuilding />,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={stats.loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BarChartSede {...porSede} />
        </div>
        <div className="lg:col-span-5">
          <DonutCategoria {...porCategoria} />
        </div>
      </div>

      {/* Movimientos + Alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <MovimientosSection {...movimientos} />
        </div>
        <div className="lg:col-span-4">
          <AlertasSection {...alertas} />
        </div>
      </div>
    </div>
  )
}
