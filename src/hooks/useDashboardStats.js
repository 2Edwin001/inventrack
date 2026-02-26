import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useDashboardStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const [
          { data: items, error: itemsErr },
          { count: sedesCount, error: sedesErr },
        ] = await Promise.all([
          supabase.from('items').select('stock, stock_minimo, precio'),
          supabase.from('sedes').select('*', { count: 'exact', head: true }),
        ])

        if (itemsErr) throw itemsErr
        if (sedesErr) throw sedesErr

        const list = items ?? []
        const valorTotal = list.reduce(
          (sum, i) => sum + (i.precio ?? 0) * (i.stock ?? 0),
          0,
        )
        const stockCritico = list.filter((i) => i.stock <= i.stock_minimo).length

        if (!cancelled) {
          setData({
            totalItems: list.length,
            valorTotal,
            stockCritico,
            totalSedes: sedesCount ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStats()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
