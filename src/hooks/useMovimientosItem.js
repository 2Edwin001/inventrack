import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMovimientosItem(itemId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!itemId) {
      setData([])
      return
    }
    setLoading(true)
    supabase
      .from('movimientos')
      .select('id, tipo, cantidad, motivo, fecha')
      .eq('item_id', itemId)
      .order('fecha', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setData(data ?? [])
        setLoading(false)
      })
  }, [itemId])

  return { data, loading }
}
