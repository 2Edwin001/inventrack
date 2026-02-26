import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabaseClient'
import { useInventario } from '../hooks/useInventario'
import { useSedes } from '../hooks/useSedes'
import { useMovimientosItem } from '../hooks/useMovimientosItem'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

// ─── Constantes ──────────────────────────────────────────────

const PAGE_SIZE = 20

// ─── Helpers ─────────────────────────────────────────────────

const fmt$ = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

function getStockVariant(stock, minimo) {
  const min = minimo ?? 0
  if (stock <= min) return 'red'
  if (stock <= min * 2) return 'yellow'
  return 'green'
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500'

// ─── Pagination ───────────────────────────────────────────────

const MAX_VIS = 5
function getRange(cur, total) {
  if (total <= MAX_VIS) return Array.from({ length: total }, (_, i) => i + 1)
  const half = Math.floor(MAX_VIS / 2)
  let start = Math.max(1, cur - half)
  const end = Math.min(total, start + MAX_VIS - 1)
  start = Math.max(1, end - MAX_VIS + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function Pagination({ page, totalPages, count, onPageChange }) {
  if (totalPages <= 1) return null
  const range = getRange(page, totalPages)
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, count)

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm dark:border-gray-700">
      <span className="text-gray-500 dark:text-gray-400">
        {from}–{to} de {count} registros
      </span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >←</button>

        {range[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">1</button>
            {range[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {range.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              p === page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >{p}</button>
        ))}

        {range[range.length - 1] < totalPages && (
          <>
            {range[range.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >→</button>
      </div>
    </div>
  )
}

// ─── ItemForm (crear y editar) ────────────────────────────────

function ItemForm({ defaultValues, sedes, categorias, onSubmit, onCancel, submitError, submitting }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const [imgError, setImgError] = useState(false)
  const imageUrl = watch('imagen_url')

  useEffect(() => {
    setImgError(false)
    reset(
      defaultValues ?? {
        codigo: '', nombre: '', descripcion: '', categoria: '',
        precio: '', stock: '', stock_minimo: 5, sede_id: '', imagen_url: '',
      },
    )
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Código" id="codigo" required placeholder="EJ-001"
          error={errors.codigo?.message}
          {...register('codigo', { required: 'El código es requerido' })}
        />
        <Input
          label="Nombre" id="nombre" required placeholder="Nombre del producto"
          error={errors.nombre?.message}
          {...register('nombre', { required: 'El nombre es requerido' })}
        />

        {/* Categoría con datalist */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
          <input
            list="cat-list"
            placeholder="Electrónica, Ferretería…"
            className={inputCls}
            {...register('categoria')}
          />
          <datalist id="cat-list">
            {categorias.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        {/* Sede */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sede</label>
          <select className={inputCls} {...register('sede_id')}>
            <option value="">Sin sede</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <Input label="Precio" id="precio" type="number" step="0.01" min="0" placeholder="0" {...register('precio')} />
        <Input label="Stock actual" id="stock" type="number" min="0" placeholder="0" {...register('stock')} />
        <Input label="Stock mínimo" id="stock_minimo" type="number" min="0" placeholder="5" {...register('stock_minimo')} />
        <Input label="URL de imagen" id="imagen_url" placeholder="https://…" {...register('imagen_url')} />
      </div>

      {/* Imagen preview */}
      {imageUrl && !imgError && (
        <div className="flex items-center gap-3">
          <img
            src={imageUrl} alt="Preview"
            className="h-14 w-14 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            onError={() => setImgError(true)}
          />
          <span className="text-xs text-gray-500">Vista previa</span>
        </div>
      )}

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea
          rows={3}
          placeholder="Descripción opcional del producto…"
          className={`${inputCls} resize-none`}
          {...register('descripcion')}
        />
      </div>

      {submitError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={submitting}>Guardar</Button>
      </div>
    </form>
  )
}

// ─── Modal de detalle ─────────────────────────────────────────

function DetailModal({ item, onClose, onEdit }) {
  const { data: movimientos, loading: movLoading } = useMovimientosItem(item?.id)
  if (!item) return null

  const variant = getStockVariant(item.stock, item.stock_minimo)
  const pct = item.stock_minimo > 0
    ? Math.min(100, Math.round((item.stock / (item.stock_minimo * 2)) * 100))
    : 100
  const statusLabel = variant === 'red' ? 'Crítico' : variant === 'yellow' ? 'Bajo' : 'OK'

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={item.nombre}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={() => { onClose(); onEdit(item) }}>Editar</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header del item */}
        <div className="flex gap-4">
          {item.imagen_url ? (
            <img
              src={item.imagen_url} alt={item.nombre}
              className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 object-cover dark:border-gray-700"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {item.codigo}
              </code>
              {item.categoria && <Badge variant="gray">{item.categoria}</Badge>}
              {item.sedes?.nombre && <Badge variant="blue">{item.sedes.nombre}</Badge>}
            </div>
            {item.descripcion && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.descripcion}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Precio', value: fmt$(item.precio) },
            { label: 'Stock actual', value: <span className="flex items-center gap-2">{item.stock} <Badge variant={variant}>{statusLabel}</Badge></span> },
            { label: 'Stock mínimo', value: item.stock_minimo },
            { label: 'Valor total', value: fmt$(item.precio * item.stock) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Barra de stock */}
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Nivel de stock</span>
            <span>{pct}% del umbral crítico</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all ${variant === 'red' ? 'bg-red-500' : variant === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Historial de movimientos */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Historial de movimientos
          </h4>
          {movLoading && <div className="flex justify-center py-6"><Spinner /></div>}
          {!movLoading && movimientos.length === 0 && (
            <EmptyState title="Sin movimientos" description="Este producto no tiene movimientos registrados." />
          )}
          {!movLoading && movimientos.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/40">
                    {['Fecha', 'Tipo', 'Cantidad', 'Motivo'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white dark:divide-gray-700/50 dark:bg-gray-800">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{fmtDate(m.fecha)}</td>
                      <td className="px-4 py-2.5"><Badge variant={m.tipo === 'ENTRADA' ? 'green' : 'yellow'}>{m.tipo}</Badge></td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{m.cantidad}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{m.motivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Página principal ─────────────────────────────────────────

export default function Inventario() {
  const location = useLocation()

  // Filtros — sedeId puede venir pre-aplicado desde la página Sedes
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(() => ({
    sedeId: location.state?.sedeId ?? '',
    categoria: '',
    precioMin: '', precioMax: '',
    stockMin: '', stockMax: '',
  }))
  const [page, setPage] = useState(1)

  // Modales
  const [modalCreate, setModalCreate] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDetail, setModalDetail] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Estados de operación
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [exporting, setExporting] = useState(false)

  // Opciones de selectores
  const { data: sedes } = useSedes()
  const [categorias, setCategorias] = useState([])

  // Datos
  const { data: items, count, loading, error, refetch } = useInventario({
    search: debouncedSearch,
    sedeId: filters.sedeId,
    categoria: filters.categoria,
    precioMin: filters.precioMin,
    precioMax: filters.precioMax,
    stockMin: filters.stockMin,
    stockMax: filters.stockMax,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.ceil(count / PAGE_SIZE)

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Cargar categorías únicas
  useEffect(() => {
    supabase
      .from('items')
      .select('categoria')
      .not('categoria', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set(data?.map((i) => i.categoria).filter(Boolean))].sort()
        setCategorias(unique)
      })
  }, [])

  // Helpers de filtros
  function updateFilter(key, val) {
    setFilters((f) => ({ ...f, [key]: val }))
    setPage(1)
  }

  function clearFilters() {
    setSearchInput('')
    setDebouncedSearch('')
    setFilters({ sedeId: '', categoria: '', precioMin: '', precioMax: '', stockMin: '', stockMax: '' })
    setPage(1)
  }

  const activeFilters =
    Object.values(filters).filter(Boolean).length + (debouncedSearch ? 1 : 0)

  // Construye query con filtros activos (para CSV)
  function buildFilteredQuery(select) {
    let q = supabase.from('items').select(select).order('nombre')
    if (debouncedSearch?.trim())
      q = q.or(`nombre.ilike.%${debouncedSearch.trim()}%,codigo.ilike.%${debouncedSearch.trim()}%`)
    if (filters.sedeId) q = q.eq('sede_id', filters.sedeId)
    if (filters.categoria) q = q.eq('categoria', filters.categoria)
    if (filters.precioMin !== '') q = q.gte('precio', Number(filters.precioMin))
    if (filters.precioMax !== '') q = q.lte('precio', Number(filters.precioMax))
    if (filters.stockMin !== '') q = q.gte('stock', Number(filters.stockMin))
    if (filters.stockMax !== '') q = q.lte('stock', Number(filters.stockMax))
    return q
  }

  // ── CRUD ───────────────────────────────────────────────────

  function buildPayload(form) {
    return {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      categoria: form.categoria?.trim() || null,
      precio: parseFloat(form.precio) || 0,
      stock: parseInt(form.stock) || 0,
      stock_minimo: parseInt(form.stock_minimo) ?? 5,
      sede_id: form.sede_id || null,
      imagen_url: form.imagen_url?.trim() || null,
    }
  }

  async function handleCreate(form) {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { error } = await supabase.from('items').insert(buildPayload(form))
      if (error) throw error
      setModalCreate(false)
      refetch()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(form) {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { error } = await supabase
        .from('items')
        .update(buildPayload(form))
        .eq('id', modalEdit.id)
      if (error) throw error
      setModalEdit(null)
      refetch()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const { error } = await supabase.from('items').delete().eq('id', confirmDelete.id)
      if (error) throw error
      setConfirmDelete(null)
      refetch()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── Exportar CSV ───────────────────────────────────────────

  async function handleExportCSV() {
    setExporting(true)
    try {
      const { data } = await buildFilteredQuery(
        'codigo, nombre, categoria, descripcion, precio, stock, stock_minimo, sedes(nombre)',
      )
      if (!data?.length) return

      const headers = ['Código', 'Nombre', 'Categoría', 'Descripción', 'Precio', 'Stock', 'Stock Mínimo', 'Sede']
      const rows = data.map((i) => [
        i.codigo, i.nombre, i.categoria ?? '', i.descripcion ?? '',
        i.precio, i.stock, i.stock_minimo, i.sedes?.nombre ?? '',
      ])

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `inventario_${new Date().toISOString().slice(0, 10)}.csv`,
      })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Cargando…' : `${count} ${count === 1 ? 'producto' : 'productos'} encontrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            loading={exporting}
            disabled={count === 0}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
          </Button>
          <Button onClick={() => { setSubmitError(''); setModalCreate(true) }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo item
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o código…"
              className={`${inputCls} pl-9`}
            />
          </div>

          {/* Filtros en grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* Sede */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sede</label>
              <select value={filters.sedeId} onChange={(e) => updateFilter('sedeId', e.target.value)} className={inputCls}>
                <option value="">Todas</option>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>

            {/* Categoría */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Categoría</label>
              <select value={filters.categoria} onChange={(e) => updateFilter('categoria', e.target.value)} className={inputCls}>
                <option value="">Todas</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Precio mín.</label>
              <input type="number" min="0" placeholder="0" value={filters.precioMin} onChange={(e) => updateFilter('precioMin', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Precio máx.</label>
              <input type="number" min="0" placeholder="∞" value={filters.precioMax} onChange={(e) => updateFilter('precioMax', e.target.value)} className={inputCls} />
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stock mín.</label>
              <input type="number" min="0" placeholder="0" value={filters.stockMin} onChange={(e) => updateFilter('stockMin', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stock máx.</label>
              <input type="number" min="0" placeholder="∞" value={filters.stockMax} onChange={(e) => updateFilter('stockMax', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Filtros activos */}
          {activeFilters > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {activeFilters}
                </span>
                filtros activos
              </span>
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="Sin productos"
            description={activeFilters > 0 ? 'No hay productos que coincidan con los filtros aplicados.' : 'Agrega tu primer producto para comenzar.'}
            action={
              activeFilters > 0
                ? <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>
                : <Button onClick={() => setModalCreate(true)}>Nuevo producto</Button>
            }
          />
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/40">
                  {['Código', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Sede', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white dark:divide-gray-700/50 dark:bg-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {item.codigo}
                      </code>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate font-medium text-gray-900 dark:text-white">{item.nombre}</p>
                      {item.descripcion && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.categoria
                        ? <Badge variant="gray">{item.categoria}</Badge>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {fmt$(item.precio)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStockVariant(item.stock, item.stock_minimo)}>
                        {item.stock}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {item.sedes?.nombre ?? <span className="text-gray-400">—</span>}
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Ver detalle */}
                        <button
                          onClick={() => setModalDetail(item)}
                          title="Ver detalle"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        {/* Editar */}
                        <button
                          onClick={() => { setSubmitError(''); setModalEdit(item) }}
                          title="Editar"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        {/* Eliminar */}
                        <button
                          onClick={() => { setDeleteError(''); setConfirmDelete(item) }}
                          title="Eliminar"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} count={count} onPageChange={setPage} />
      </div>

      {/* FAB */}
      <button
        onClick={() => { setSubmitError(''); setModalCreate(true) }}
        title="Nuevo producto"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Modal: Crear */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Nuevo producto"
        size="lg"
      >
        <ItemForm
          key={`create-${modalCreate}`}
          defaultValues={null}
          sedes={sedes}
          categorias={categorias}
          onSubmit={handleCreate}
          onCancel={() => setModalCreate(false)}
          submitError={submitError}
          submitting={submitting}
        />
      </Modal>

      {/* Modal: Editar */}
      <Modal
        isOpen={!!modalEdit}
        onClose={() => setModalEdit(null)}
        title="Editar producto"
        size="lg"
      >
        <ItemForm
          key={`edit-${modalEdit?.id}`}
          defaultValues={modalEdit}
          sedes={sedes}
          categorias={categorias}
          onSubmit={handleEdit}
          onCancel={() => setModalEdit(null)}
          submitError={submitError}
          submitting={submitting}
        />
      </Modal>

      {/* Modal: Detalle */}
      <DetailModal
        item={modalDetail}
        onClose={() => setModalDetail(null)}
        onEdit={(item) => { setSubmitError(''); setModalEdit(item) }}
      />

      {/* Modal: Confirmar eliminación */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Eliminar producto"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Eliminar</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ¿Estás seguro de que deseas eliminar{' '}
          <strong className="text-gray-900 dark:text-white">{confirmDelete?.nombre}</strong>?
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Esta acción eliminará también todos los movimientos asociados y no se puede deshacer.
        </p>
        {deleteError && (
          <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  )
}
