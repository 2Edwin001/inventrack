import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useItemsPorCategoria() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const { data: items, error } = await supabase
          .from('items')
          .select('categoria')

        if (error) throw error

        const map = {}
        for (const item of items ?? []) {
          const cat = item.categoria?.trim() || 'Sin categoría'
          map[cat] = (map[cat] ?? 0) + 1
        }

        const result = Object.entries(map)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)

        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
