import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMovimientos({ tipo, fechaDesde, fechaHasta, sedeId, page = 1, pageSize = 20 }) {
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Usar !inner join cuando se filtra por sede para aplicar WHERE sobre la tabla relacionada
      const selectStr = sedeId
        ? 'id, tipo, cantidad, motivo, fecha, items!inner(nombre, codigo, sede_id, sedes(nombre))'
        : 'id, tipo, cantidad, motivo, fecha, items(nombre, codigo, sedes(nombre))'

      let query = supabase
        .from('movimientos')
        .select(selectStr, { count: 'exact' })
        .order('fecha', { ascending: false })

      if (tipo && tipo !== 'TODOS') query = query.eq('tipo', tipo)
      if (fechaDesde) query = query.gte('fecha', `${fechaDesde}T00:00:00`)
      if (fechaHasta) query = query.lte('fecha', `${fechaHasta}T23:59:59`)
      if (sedeId) query = query.eq('items.sede_id', sedeId)

      const from = (page - 1) * pageSize
      query = query.range(from, from + pageSize - 1)

      const { data: rows, count: total, error: qErr } = await query
      if (qErr) throw qErr

      setData(rows ?? [])
      setCount(total ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tipo, fechaDesde, fechaHasta, sedeId, page, pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, count, loading, error, refetch: fetchData }
}
