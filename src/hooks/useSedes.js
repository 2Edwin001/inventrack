import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSedes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('sedes')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => {
        setData(data ?? [])
        setLoading(false)
      })
  }, [])

  return { data, loading }
}
