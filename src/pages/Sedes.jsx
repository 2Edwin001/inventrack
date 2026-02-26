import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabaseClient'
import { useSedes } from '../hooks/useSedes'
import Modal from '../components/Modal'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

// ─── Helpers ──────────────────────────────────────────────────

const fmt$ = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

function sedeStats(items = []) {
  return {
    itemCount: items.length,
    valorTotal: items.reduce((sum, i) => sum + (i.precio ?? 0) * (i.stock ?? 0), 0),
    stockCritico: items.filter((i) => (i.stock ?? 0) <= (i.stock_minimo ?? 0)).length,
  }
}

// ─── Icons ────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const BuildingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const PencilIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" />
  </svg>
)

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

// ─── SedeForm ─────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'

function SedeForm({ defaultValues = {}, onSubmit, onCancel, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nombre', { required: 'El nombre es requerido' })}
          placeholder="Ej. Bodega Central"
          className={inputCls}
        />
        {errors.nombre && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <input
          {...register('ciudad', { required: 'La ciudad es requerida' })}
          placeholder="Ej. Bogotá"
          className={inputCls}
        />
        {errors.ciudad && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.ciudad.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dirección
        </label>
        <input
          {...register('direccion')}
          placeholder="Ej. Calle 123 # 45-67"
          className={inputCls}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

// ─── LoadingSkeleton ──────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="mb-4 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[...Array(3)].map((__, j) => (
              <div key={j} className="h-14 rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
          <div className="h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  )
}

// ─── SedeCard ─────────────────────────────────────────────────

function SedeCard({ sede, onEdit, onDelete, onVerInventario }) {
  const { itemCount, valorTotal, stockCritico } = sedeStats(sede.items)

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          {/* Icon + name */}
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
              <BuildingIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {sede.nombre}
              </h3>
              <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon />
                <span className="truncate">{sede.ciudad}</span>
              </p>
            </div>
          </div>

          {/* Edit / Delete */}
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(sede)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
              title="Editar"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => onDelete(sede)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Eliminar"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Dirección */}
        {sede.direccion && (
          <p className="mb-3 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
            {sede.direccion}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {/* Total ítems */}
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ítems</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white">{itemCount}</p>
          </div>

          {/* Valor total */}
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
            <p className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
              {fmt$(valorTotal)}
            </p>
          </div>

          {/* Stock crítico */}
          <div
            className={`rounded-xl p-3 ${
              stockCritico > 0
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-gray-50 dark:bg-gray-700/40'
            }`}
          >
            <p
              className={`text-xs ${
                stockCritico > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Críticos
            </p>
            <p
              className={`mt-0.5 text-xl font-bold ${
                stockCritico > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {stockCritico}
            </p>
          </div>
        </div>
      </div>

      {/* Footer — Ver inventario */}
      <div className="border-t border-gray-100 p-3 dark:border-gray-700">
        <button
          onClick={() => onVerInventario(sede)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
          Ver inventario
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────

export default function Sedes() {
  const navigate = useNavigate()
  const { data: sedes, loading, error, refetch } = useSedes()

  const [modalCreate, setModalCreate] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState(null)

  const openCreate = useCallback(() => { setFormError(null); setModalCreate(true) }, [])
  const openEdit = useCallback((sede) => { setFormError(null); setModalEdit(sede) }, [])
  const openDelete = useCallback((sede) => { setFormError(null); setModalDelete(sede) }, [])

  const handleVerInventario = useCallback(
    (sede) => navigate('/inventario', { state: { sedeId: sede.id } }),
    [navigate],
  )

  // --- Create ---
  const handleCreate = useCallback(
    async (values) => {
      setSaving(true)
      setFormError(null)
      const { error: e } = await supabase.from('sedes').insert([{
        nombre: values.nombre.trim(),
        ciudad: values.ciudad.trim(),
        direccion: values.direccion?.trim() || null,
      }])
      setSaving(false)
      if (e) { setFormError(e.message); return }
      setModalCreate(false)
      refetch()
    },
    [refetch],
  )

  // --- Update ---
  const handleUpdate = useCallback(
    async (values) => {
      if (!modalEdit) return
      setSaving(true)
      setFormError(null)
      const { error: e } = await supabase
        .from('sedes')
        .update({
          nombre: values.nombre.trim(),
          ciudad: values.ciudad.trim(),
          direccion: values.direccion?.trim() || null,
        })
        .eq('id', modalEdit.id)
      setSaving(false)
      if (e) { setFormError(e.message); return }
      setModalEdit(null)
      refetch()
    },
    [modalEdit, refetch],
  )

  // --- Delete ---
  const handleDelete = useCallback(async () => {
    if (!modalDelete) return
    setDeleting(true)
    const { error: e } = await supabase.from('sedes').delete().eq('id', modalDelete.id)
    setDeleting(false)
    if (e) { setFormError(e.message); return }
    setModalDelete(null)
    refetch()
  }, [modalDelete, refetch])

  const deleteItemCount = modalDelete?.items?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sedes</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? 'Cargando…'
              : `${sedes.length} ${sedes.length === 1 ? 'sede registrada' : 'sedes registradas'}`}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Nueva sede
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Error al cargar las sedes: {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : sedes.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <EmptyState
            title="Sin sedes registradas"
            description="Crea tu primera sede para comenzar a asociar inventario por ubicación."
            icon={
              <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
            action={
              <Button onClick={openCreate}>
                <PlusIcon />
                Crear sede
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sedes.map((sede) => (
            <SedeCard
              key={sede.id}
              sede={sede}
              onEdit={openEdit}
              onDelete={openDelete}
              onVerInventario={handleVerInventario}
            />
          ))}
        </div>
      )}

      {/* Modal: Crear */}
      <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} title="Nueva sede" size="sm">
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {formError}
          </div>
        )}
        <SedeForm
          key={`create-${modalCreate}`}
          onSubmit={handleCreate}
          onCancel={() => setModalCreate(false)}
          loading={saving}
        />
      </Modal>

      {/* Modal: Editar */}
      <Modal isOpen={!!modalEdit} onClose={() => setModalEdit(null)} title="Editar sede" size="sm">
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {formError}
          </div>
        )}
        <SedeForm
          key={`edit-${modalEdit?.id}`}
          defaultValues={modalEdit ?? {}}
          onSubmit={handleUpdate}
          onCancel={() => setModalEdit(null)}
          loading={saving}
        />
      </Modal>

      {/* Modal: Eliminar */}
      <Modal isOpen={!!modalDelete} onClose={() => setModalDelete(null)} title="Eliminar sede" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ¿Estás seguro de eliminar{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{modalDelete?.nombre}</span>?
          </p>

          {deleteItemCount > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Esta sede tiene{' '}
              <strong>{deleteItemCount} {deleteItemCount === 1 ? 'ítem' : 'ítems'}</strong>{' '}
              asociados. Al eliminarla, esos ítems quedarán sin sede asignada.
            </div>
          )}

          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalDelete(null)}>Cancelar</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
