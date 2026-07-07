const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SimulatorStatus {
  isRunning: boolean;
  generatedCount: number;
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
