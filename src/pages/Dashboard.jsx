import { useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Table from '../components/Table'
import { useAlerts } from '../context/AlertContext'

const chartData = [
  { dia: 'Lun', entradas: 12, salidas: 8 },
  { dia: 'Mar', entradas: 19, salidas: 14 },
  { dia: 'Mié', entradas: 7, salidas: 11 },
  { dia: 'Jue', entradas: 23, salidas: 17 },
  { dia: 'Vie', entradas: 15, salidas: 9 },
  { dia: 'Sáb', entradas: 4, salidas: 2 },
  { dia: 'Dom', entradas: 0, salidas: 0 },
]

const lowStockItems = [
  { id: 1, nombre: 'Tornillo M8 x 25mm', categoria: 'Ferretería', stock: 5, minimo: 20, sede: 'Sede Central' },
  { id: 2, nombre: 'Pintura Blanca 1L', categoria: 'Pinturería', stock: 2, minimo: 10, sede: 'Sucursal Norte' },
  { id: 3, nombre: 'Cable HDMI 2m', categoria: 'Electrónica', stock: 1, minimo: 5, sede: 'Sede Central' },
]

const statCols = [
  { key: 'nombre', header: 'Producto' },
  { key: 'categoria', header: 'Categoría' },
  {
    key: 'stock',
    header: 'Stock actual',
    render: (val, row) => (
      <Badge variant={val <= row.minimo * 0.3 ? 'red' : 'yellow'}>
        {val} unidades
      </Badge>
    ),
  },
  { key: 'minimo', header: 'Mínimo requerido' },
  { key: 'sede', header: 'Sede' },
]

const stats = [
  {
    label: 'Total Productos',
    value: '284',
    sub: '18 categorías',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: 'Stock Bajo',
    value: '12',
    sub: 'requieren atención',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: 'Movimientos Hoy',
    value: '8',
    sub: '+2 respecto a ayer',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    label: 'Sedes Activas',
    value: '3',
    sub: 'en operación',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1.5 font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { setAlertCount } = useAlerts()

  useEffect(() => {
    setAlertCount(lowStockItems.length)
    return () => setAlertCount(0)
  }, [setAlertCount])

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="truncate text-xs text-gray-400 dark:text-gray-500">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card title="Movimientos — últimos 7 días">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              formatter={(name) => (
                <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{name}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="entradas"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="salidas"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Low stock table */}
      <Card
        title="Productos con stock bajo"
        action={
          <Badge variant="yellow">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {lowStockItems.length} alertas
          </Badge>
        }
      >
        <Table
          columns={statCols}
          data={lowStockItems}
          emptyTitle="Sin alertas de stock"
          emptyDescription="Todos los productos están dentro del rango mínimo."
        />
      </Card>
    </div>
  )
}
