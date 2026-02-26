import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useItemsPorSede() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const { data: items, error } = await supabase
          .from('items')
          .select('sede_id, sedes(nombre)')

        if (error) throw error

        const map = {}
        for (const item of items ?? []) {
          const nombre = item.sedes?.nombre ?? 'Sin sede'
          map[nombre] = (map[nombre] ?? 0) + 1
        }

        const result = Object.entries(map)
          .map(([sede, cantidad]) => ({ sede, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)

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
