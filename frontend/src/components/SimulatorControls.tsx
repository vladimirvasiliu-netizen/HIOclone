import { useSimulator } from '../hooks/useSimulator';

export function SimulatorControls() {
  const { status, isToggling, start, stop } = useSimulator();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          status.isRunning ? 'bg-green-500' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      />
      <span className="text-sm text-slate-600">
        {status.isRunning ? 'Simulator activ' : 'Simulator oprit'}
        {status.generatedCount > 0 && (
          <span className="text-slate-400"> · {status.generatedCount} generate</span>
        )}
      </span>

      <button
        onClick={start}
        disabled={isToggling || status.isRunning}
        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start comenzi
      </button>
      <button
        onClick={stop}
        disabled={isToggling || !status.isRunning}
        className="rounded-md bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Stop comenzi
      </button>
    </div>
  );
}
