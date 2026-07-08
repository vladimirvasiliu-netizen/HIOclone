/**
 * Apeluri catre serverul Express standalone pentru curieri (drivers-server).
 * URL-ul de baza vine din VITE_DRIVERS_API_URL (ex. http://localhost:4000).
 */
export type DriverStatus = 'online' | 'busy' | 'offline';

export interface Driver {
  id: number;
  name: string;
  vehicle: string;
  status: DriverStatus;
  deliveriesToday: number;
}

export interface NewDriver {
  name: string;
  vehicle: string;
  status?: DriverStatus;
}

const API_BASE_URL = import.meta.env.VITE_DRIVERS_API_URL;

export async function getDrivers(): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/drivers`);
  if (!response.ok) {
    throw new Error(`Nu am putut incarca curierii (status ${response.status})`);
  }
  return response.json();
}

export async function createDriver(payload: NewDriver): Promise<Driver> {
  const response = await fetch(`${API_BASE_URL}/drivers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Nu am putut adauga curierul (status ${response.status})`);
  }
  return response.json();
}

export async function deleteDriver(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/drivers/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Nu am putut sterge curierul (status ${response.status})`);
  }
}
