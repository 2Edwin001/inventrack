import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useUltimosMovimientos() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const { data: movimientos, error } = await supabase
          .from('movimientos')
          .select('id, tipo, cantidad, motivo, fecha, items(nombre, codigo)')
          .order('fecha', { ascending: false })
          .limit(10)

        if (error) throw error

        if (!cancelled) setData(movimientos ?? [])
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
