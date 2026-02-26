import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'
import { useSedes } from '../hooks/useSedes'
import Button from '../components/Button'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

// ─── Constantes ───────────────────────────────────────────────

const todayStr = new Date().toISOString().slice(0, 10)
const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

// ─── Utilidades ───────────────────────────────────────────────

const fmt$ = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

const fmtShort = (n) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt$(n)
}

function downloadCSV(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `${filename}_${todayStr}.csv`,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function printSection(sectionId) {
  const styleId = '__rpt_print__'
  document.getElementById(styleId)?.remove()
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @media print {
      body * { visibility: hidden !important; }
      #${sectionId}, #${sectionId} * { visibility: visible !important; }
      #${sectionId} { position: absolute !important; left: 0 !important; top: 0 !important; right: 0 !important; padding: 24px !important; }
      #${sectionId} .no-print { display: none !important; }
    }
  `
  document.head.appendChild(style)
  window.addEventListener('afterprint', () => document.getElementById(styleId)?.remove(), {
    once: true,
  })
  window.print()
}

function stockStatus(stock, minimo) {
  const s = stock ?? 0
  const m = minimo ?? 0
  if (s === 0) return { label: 'AGOTADO', cls: 'text-red-600 dark:text-red-400', rowCls: 'bg-red-50/60 dark:bg-red-900/10' }
  if (s <= m) return { label: 'CRÍTICO', cls: 'text-amber-600 dark:text-amber-400', rowCls: 'bg-amber-50/60 dark:bg-amber-900/10' }
  return { label: 'OK', cls: 'text-emerald-600 dark:text-emerald-400', rowCls: '' }
}

const inputCls =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'

const thCls =
  'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'

const tdCls = 'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300'

// ─── Chart Tooltip ────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1.5 font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}:{' '}
          <span className="font-semibold">
            {typeof p.value === 'number' && p.value >= 1000 ? fmtShort(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

// ─── Íconos ───────────────────────────────────────────────────

const PrintIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
)

// ─── SectionCard ──────────────────────────────────────────────

function SectionCard({ id, title, onCSV, csvDisabled, children }) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
    >
      <div className="no-print flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => printSection(id)}>
            <PrintIcon />
            PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={onCSV} disabled={csvDisabled}>
            <DownloadIcon />
            CSV
          </Button>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

// ─── Página principal ─────────────────────────────────────────

export default function Reportes() {
  // Sedes — usadas en varios filtros y en "Valor por sede"
  const { data: sedesAll, loading: sedesLoading } = useSedes()

  // Categorías para filtro de stock
  const [categorias, setCategorias] = useState([])

  // ── Estado: Resumen General ──────────────────────────────────
  const [resumenLoading, setResumenLoading] = useState(true)
  const [resumenItems, setResumenItems] = useState([])
  const [resumenFiltros, setResumenFiltros] = useState({
    sedeId: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  // ── Estado: Reporte de Stock ─────────────────────────────────
  const [stockLoading, setStockLoading] = useState(true)
  const [stockItems, setStockItems] = useState([])
  const [stockFiltros, setStockFiltros] = useState({ sedeId: '', categoria: '' })

  // ── Estado: Reporte de Movimientos ───────────────────────────
  const [movLoading, setMovLoading] = useState(true)
  const [movRaw, setMovRaw] = useState([])
  const [movFiltros, setMovFiltros] = useState({
    fechaDesde: thirtyDaysAgoStr,
    fechaHasta: todayStr,
  })

  // ── Cargar categorías únicas ─────────────────────────────────
  useEffect(() => {
    supabase
      .from('items')
      .select('categoria')
      .not('categoria', 'is', null)
      .then(({ data }) => {
        setCategorias(
          [...new Set(data?.map((i) => i.categoria).filter(Boolean))].sort(),
        )
      })
  }, [])

  // ── Fetch: Resumen General ───────────────────────────────────
  useEffect(() => {
    setResumenLoading(true)
    let q = supabase.from('items').select('precio, stock, stock_minimo')
    if (resumenFiltros.sedeId) q = q.eq('sede_id', resumenFiltros.sedeId)
    if (resumenFiltros.fechaDesde)
      q = q.gte('created_at', `${resumenFiltros.fechaDesde}T00:00:00`)
    if (resumenFiltros.fechaHasta)
      q = q.lte('created_at', `${resumenFiltros.fechaHasta}T23:59:59`)
    q.then(({ data }) => {
      setResumenItems(data ?? [])
      setResumenLoading(false)
    })
  }, [resumenFiltros])

  // ── Fetch: Reporte de Stock ──────────────────────────────────
  useEffect(() => {
    setStockLoading(true)
    let q = supabase
      .from('items')
      .select('id, codigo, nombre, categoria, stock, stock_minimo, sedes(nombre)')
      .order('nombre')
    if (stockFiltros.sedeId) q = q.eq('sede_id', stockFiltros.sedeId)
    if (stockFiltros.categoria) q = q.eq('categoria', stockFiltros.categoria)
    q.then(({ data }) => {
      setStockItems(data ?? [])
      setStockLoading(false)
    })
  }, [stockFiltros])

  // ── Fetch: Movimientos ───────────────────────────────────────
  useEffect(() => {
    setMovLoading(true)
    let q = supabase
      .from('movimientos')
      .select('id, tipo, cantidad, fecha, item_id, items(nombre, codigo, stock)')
      .order('fecha')
    if (movFiltros.fechaDesde)
      q = q.gte('fecha', `${movFiltros.fechaDesde}T00:00:00`)
    if (movFiltros.fechaHasta)
      q = q.lte('fecha', `${movFiltros.fechaHasta}T23:59:59`)
    q.then(({ data }) => {
      setMovRaw(data ?? [])
      setMovLoading(false)
    })
  }, [movFiltros])

  // ── Datos derivados ──────────────────────────────────────────

  const resumenStats = useMemo(() => {
    const total = resumenItems.length
    const valor = resumenItems.reduce(
      (s, i) => s + (i.precio ?? 0) * (i.stock ?? 0),
      0,
    )
    const criticos = resumenItems.filter(
      (i) => (i.stock ?? 0) > 0 && (i.stock ?? 0) <= (i.stock_minimo ?? 0),
    ).length
    const agotados = resumenItems.filter((i) => (i.stock ?? 0) === 0).length
    return { total, valor, criticos, agotados }
  }, [resumenItems])

  // Movimientos agrupados por día para el gráfico de línea
  const movChartData = useMemo(() => {
    const map = {}
    movRaw.forEach((m) => {
      const day = m.fecha.slice(0, 10)
      if (!map[day]) map[day] = { fecha: day, ENTRADA: 0, SALIDA: 0 }
      map[day][m.tipo] += m.cantidad
    })
    return Object.values(map)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((d) => ({
        ...d,
        label: new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
        }),
      }))
  }, [movRaw])

  // Movimientos agrupados por producto para la tabla resumen
  const movSummary = useMemo(() => {
    const map = {}
    movRaw.forEach((m) => {
      if (!m.item_id) return
      if (!map[m.item_id])
        map[m.item_id] = {
          nombre: m.items?.nombre ?? '—',
          codigo: m.items?.codigo ?? '—',
          stock: m.items?.stock ?? 0,
          entradas: 0,
          salidas: 0,
        }
      if (m.tipo === 'ENTRADA') map[m.item_id].entradas += m.cantidad
      else map[m.item_id].salidas += m.cantidad
    })
    return Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [movRaw])

  // Estadísticas por sede
  const sedesStats = useMemo(
    () =>
      sedesAll
        .map((s) => {
          const items = s.items ?? []
          return {
            id: s.id,
            nombre: s.nombre,
            itemCount: items.length,
            valor: items.reduce(
              (sum, i) => sum + (i.precio ?? 0) * (i.stock ?? 0),
              0,
            ),
            criticos: items.filter(
              (i) => (i.stock ?? 0) > 0 && (i.stock ?? 0) <= (i.stock_minimo ?? 0),
            ).length,
            agotados: items.filter((i) => (i.stock ?? 0) === 0).length,
          }
        })
        .sort((a, b) => b.valor - a.valor),
    [sedesAll],
  )

  // ── Exportar CSV ─────────────────────────────────────────────

  function exportResumenCSV() {
    downloadCSV('resumen_general', ['Métrica', 'Valor'], [
      ['Total de productos', resumenStats.total],
      ['Valor total del inventario', fmt$(resumenStats.valor)],
      ['Items con stock crítico', resumenStats.criticos],
      ['Items agotados', resumenStats.agotados],
    ])
  }

  function exportStockCSV() {
    downloadCSV(
      'reporte_stock',
      ['Código', 'Nombre', 'Categoría', 'Sede', 'Stock actual', 'Stock mínimo', 'Estado'],
      stockItems.map((i) => {
        const { label } = stockStatus(i.stock, i.stock_minimo)
        return [
          i.codigo,
          i.nombre,
          i.categoria ?? '',
          i.sedes?.nombre ?? '',
          i.stock,
          i.stock_minimo,
          label,
        ]
      }),
    )
  }

  function exportMovCSV() {
    downloadCSV(
      'reporte_movimientos',
      ['Código', 'Nombre', 'Total entradas', 'Total salidas', 'Stock actual'],
      movSummary.map((m) => [m.codigo, m.nombre, m.entradas, m.salidas, m.stock]),
    )
  }

  function exportSedesCSV() {
    downloadCSV(
      'valor_por_sede',
      ['Sede', 'Items totales', 'Valor total', 'Críticos', 'Agotados'],
      sedesStats.map((s) => [s.nombre, s.itemCount, fmt$(s.valor), s.criticos, s.agotados]),
    )
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Análisis y exportación del inventario por secciones.
        </p>
      </div>

      {/* ─── 1. Resumen General ─────────────────────────────── */}
      <SectionCard
        id="rpt-resumen"
        title="Resumen general"
        onCSV={exportResumenCSV}
        csvDisabled={resumenLoading}
      >
        {/* Filtros */}
        <div className="no-print mb-6 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sede</label>
            <select
              value={resumenFiltros.sedeId}
              onChange={(e) => setResumenFiltros((f) => ({ ...f, sedeId: e.target.value }))}
              className={inputCls}
            >
              <option value="">Todas las sedes</option>
              {sedesAll.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Registrado desde
            </label>
            <input
              type="date"
              value={resumenFiltros.fechaDesde}
              onChange={(e) => setResumenFiltros((f) => ({ ...f, fechaDesde: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
            <input
              type="date"
              value={resumenFiltros.fechaHasta}
              onChange={(e) => setResumenFiltros((f) => ({ ...f, fechaHasta: e.target.value }))}
              className={inputCls}
            />
          </div>
          {(resumenFiltros.sedeId || resumenFiltros.fechaDesde || resumenFiltros.fechaHasta) && (
            <button
              onClick={() => setResumenFiltros({ sedeId: '', fechaDesde: '', fechaHasta: '' })}
              className="self-end pb-2 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Stats */}
        {resumenLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Total productos',
                value: resumenStats.total,
                cls: 'text-indigo-600 dark:text-indigo-400',
              },
              {
                label: 'Valor total',
                value: fmt$(resumenStats.valor),
                cls: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Stock crítico',
                value: resumenStats.criticos,
                cls:
                  resumenStats.criticos > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-white',
              },
              {
                label: 'Agotados',
                value: resumenStats.agotados,
                cls:
                  resumenStats.agotados > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white',
              },
            ].map(({ label, value, cls }) => (
              <div key={label} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ─── 2. Reporte de Stock ─────────────────────────────── */}
      <SectionCard
        id="rpt-stock"
        title="Reporte de stock"
        onCSV={exportStockCSV}
        csvDisabled={stockLoading || stockItems.length === 0}
      >
        {/* Filtros */}
        <div className="no-print mb-5 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sede</label>
            <select
              value={stockFiltros.sedeId}
              onChange={(e) => setStockFiltros((f) => ({ ...f, sedeId: e.target.value }))}
              className={inputCls}
            >
              <option value="">Todas las sedes</option>
              {sedesAll.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Categoría</label>
            <select
              value={stockFiltros.categoria}
              onChange={(e) => setStockFiltros((f) => ({ ...f, categoria: e.target.value }))}
              className={inputCls}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {(stockFiltros.sedeId || stockFiltros.categoria) && (
            <button
              onClick={() => setStockFiltros({ sedeId: '', categoria: '' })}
              className="self-end pb-2 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        {stockLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : stockItems.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="No hay items que coincidan con los filtros aplicados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                  {['Código', 'Nombre', 'Categoría', 'Sede', 'Stock', 'Mínimo', 'Estado'].map(
                    (h) => (
                      <th key={h} className={thCls}>{h}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {stockItems.map((item) => {
                  const { label, cls, rowCls } = stockStatus(item.stock, item.stock_minimo)
                  return (
                    <tr
                      key={item.id}
                      className={`${rowCls} transition-colors hover:brightness-95 dark:hover:brightness-110`}
                    >
                      <td className={tdCls}>
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {item.codigo}
                        </code>
                      </td>
                      <td className={`${tdCls} font-medium text-gray-900 dark:text-white`}>
                        {item.nombre}
                      </td>
                      <td className={tdCls}>{item.categoria ?? '—'}</td>
                      <td className={tdCls}>{item.sedes?.nombre ?? '—'}</td>
                      <td className={`${tdCls} font-medium text-gray-900 dark:text-white`}>
                        {item.stock}
                      </td>
                      <td className={tdCls}>{item.stock_minimo}</td>
                      <td className={`${tdCls} font-semibold ${cls}`}>{label}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="px-4 py-2 text-right text-xs text-gray-400 dark:text-gray-500">
              {stockItems.length} {stockItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        )}
      </SectionCard>

      {/* ─── 3. Reporte de Movimientos ───────────────────────── */}
      <SectionCard
        id="rpt-movimientos"
        title="Reporte de movimientos"
        onCSV={exportMovCSV}
        csvDisabled={movLoading || movSummary.length === 0}
      >
        {/* Filtros */}
        <div className="no-print mb-5 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
            <input
              type="date"
              value={movFiltros.fechaDesde}
              onChange={(e) => setMovFiltros((f) => ({ ...f, fechaDesde: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
            <input
              type="date"
              value={movFiltros.fechaHasta}
              onChange={(e) => setMovFiltros((f) => ({ ...f, fechaHasta: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>

        {movLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : movChartData.length === 0 ? (
          <EmptyState
            title="Sin movimientos"
            description="No hay movimientos en el período seleccionado."
          />
        ) : (
          <div className="space-y-8">
            {/* Gráfico de línea */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Entradas vs salidas por día
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={movChartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(156,163,175,0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="ENTRADA"
                      name="Entradas"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="SALIDA"
                      name="Salidas"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla resumen por producto */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Resumen por producto
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                      {['Código', 'Nombre', 'Total entradas', 'Total salidas', 'Stock actual'].map(
                        (h) => (
                          <th key={h} className={thCls}>{h}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {movSummary.map((m) => (
                      <tr
                        key={m.codigo}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                      >
                        <td className={tdCls}>
                          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {m.codigo}
                          </code>
                        </td>
                        <td className={`${tdCls} font-medium text-gray-900 dark:text-white`}>
                          {m.nombre}
                        </td>
                        <td className={`${tdCls} font-semibold text-emerald-600 dark:text-emerald-400`}>
                          +{m.entradas}
                        </td>
                        <td className={`${tdCls} font-semibold text-amber-600 dark:text-amber-400`}>
                          -{m.salidas}
                        </td>
                        <td className={`${tdCls} text-gray-900 dark:text-white`}>{m.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─── 4. Valor por Sede ───────────────────────────────── */}
      <SectionCard
        id="rpt-sedes"
        title="Valor por sede"
        onCSV={exportSedesCSV}
        csvDisabled={sedesLoading || sedesStats.length === 0}
      >
        {sedesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : sedesStats.length === 0 ? (
          <EmptyState
            title="Sin sedes"
            description="No hay sedes registradas con inventario."
          />
        ) : (
          <div className="space-y-8">
            {/* Gráfico de barras */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor total del inventario por sede
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sedesStats}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(156,163,175,0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="nombre"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={fmtShort}
                      width={70}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="valor"
                      name="Valor inventario"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla por sede */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                    {['Sede', 'Items totales', 'Valor total', 'Críticos', 'Agotados'].map((h) => (
                      <th key={h} className={thCls}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {sedesStats.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                    >
                      <td className={`${tdCls} font-medium text-gray-900 dark:text-white`}>
                        {s.nombre}
                      </td>
                      <td className={tdCls}>{s.itemCount}</td>
                      <td className={`${tdCls} font-medium text-gray-900 dark:text-white`}>
                        {fmt$(s.valor)}
                      </td>
                      <td
                        className={`${tdCls} font-semibold ${
                          s.criticos > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {s.criticos}
                      </td>
                      <td
                        className={`${tdCls} font-semibold ${
                          s.agotados > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {s.agotados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
