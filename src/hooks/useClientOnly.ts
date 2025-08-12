import { useEffect, useState } from 'react'

/**
 * Hook para prevenir problemas de hidratación en Next.js
 * Retorna true solo después de que el componente se ha montado en el cliente
 */
export function useClientOnly() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
