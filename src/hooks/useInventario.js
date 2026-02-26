import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useInventario({
  search,
  sedeId,
  categoria,
  precioMin,
  precioMax,
  stockMin,
  stockMax,
  page = 1,
  pageSize = 20,
}) {
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('items')
        .select('*, sedes(nombre)', { count: 'exact' })

      if (search?.trim()) {
        query = query.or(
          `nombre.ilike.%${search.trim()}%,codigo.ilike.%${search.trim()}%`,
        )
      }
      if (sedeId) query = query.eq('sede_id', sedeId)
      if (categoria) query = query.eq('categoria', categoria)
      if (precioMin !== '' && precioMin != null) query = query.gte('precio', Number(precioMin))
      if (precioMax !== '' && precioMax != null) query = query.lte('precio', Number(precioMax))
      if (stockMin !== '' && stockMin != null) query = query.gte('stock', Number(stockMin))
      if (stockMax !== '' && stockMax != null) query = query.lte('stock', Number(stockMax))

      const from = (page - 1) * pageSize
      query = query.range(from, from + pageSize - 1).order('nombre')

      const { data: items, count: total, error: qErr } = await query
      if (qErr) throw qErr

      setData(items ?? [])
      setCount(total ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, sedeId, categoria, precioMin, precioMax, stockMin, stockMax, page, pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, count, loading, error, refetch: fetchData }
}
