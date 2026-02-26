import { useCallback, useEffect, useState } from 'react'
import { unwrapList } from '../services/api'

export default function useResourceList({ fetcher, errorMessage = 'No se pudo cargar la información.', transform }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetcher()
      const baseRows = unwrapList(res.data)
      setItems(transform ? transform(baseRows) : baseRows)
    } catch {
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetcher, errorMessage, transform])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { items, setItems, loading, error, setError, refresh }
}
