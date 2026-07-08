import { useCallback, useEffect, useState } from 'react';
import { getDrivers, type Driver } from '../api/driversApi';

/**
 * Incarca curierii de la serverul Express si expune stari de loading/error.
 * `refetch` reincarca lista (folosit dupa create/delete).
 */
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      // Include si erorile de retea (ex. URL gresit / server oprit).
      setError(err instanceof Error ? err.message : 'Eroare necunoscuta');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, isLoading, error, refetch: fetchDrivers };
}
