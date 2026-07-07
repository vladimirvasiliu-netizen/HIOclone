import { useCallback, useEffect, useState } from 'react';
import {
  getSimulatorStatus,
  startSimulator,
  stopSimulator,
  SimulatorStatus,
} from '../api/simulatorApi';

const POLL_INTERVAL_MS = 4000;

export function useSimulator() {
  const [status, setStatus] = useState<SimulatorStatus>({
    isRunning: false,
    generatedCount: 0,
  });
  const [isToggling, setIsToggling] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getSimulatorStatus();
      setStatus(data);
    } catch {
      // eroare tranzitorie de retea - se reincearca la urmatorul poll
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const start = async () => {
    setIsToggling(true);
    try {
      const data = await startSimulator();
      setStatus(data);
    } finally {
      setIsToggling(false);
    }
  };

  const stop = async () => {
    setIsToggling(true);
    try {
      const data = await stopSimulator();
      setStatus(data);
    } finally {
      setIsToggling(false);
    }
  };

  return { status, isToggling, start, stop };
}
