const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SimulatorStatus {
  isRunning: boolean;
  generatedCount: number;
  mix: { glovo: number; boltFood: number };
}

async function postAndParse(path: string): Promise<SimulatorStatus> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Eroare simulator (status ${response.status})`);
  }
  return response.json();
}

export async function startSimulator(): Promise<SimulatorStatus> {
  return postAndParse('/simulator/start');
}

export async function stopSimulator(): Promise<SimulatorStatus> {
  return postAndParse('/simulator/stop');
}

export async function getSimulatorStatus(): Promise<SimulatorStatus> {
  const response = await fetch(`${API_BASE_URL}/simulator/status`);
  if (!response.ok) {
    throw new Error(`Eroare simulator (status ${response.status})`);
  }
  return response.json();
}

/** Seteaza procentul de comenzi Glovo (0-100); Bolt Food primeste restul. */
export async function setSimulatorMix(glovo: number): Promise<SimulatorStatus> {
  const response = await fetch(`${API_BASE_URL}/simulator/mix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ glovo }),
  });
  if (!response.ok) {
    throw new Error(`Eroare simulator (status ${response.status})`);
  }
  return response.json();
}
