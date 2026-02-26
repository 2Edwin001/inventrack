import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAlertasStock() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        // Column-to-column comparison requires client-side filtering
        const { data: items, error } = await supabase
          .from('items')
          .select('id, nombre, codigo, stock, stock_minimo, sedes(nombre)')

        if (error) throw error

        const alertas = (items ?? [])
          .filter((i) => i.stock <= i.stock_minimo)
          .sort((a, b) => a.stock - b.stock) // más críticos primero

        if (!cancelled) setData(alertas)
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
