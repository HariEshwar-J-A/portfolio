/**
 * Stockfish WASM UCI bridge (same-origin worker under /stockfish/).
 */

export interface EngineMoveResult {
  bestMove: string; // e2e4 or e7e8q
  ponder?: string;
}

export interface EngineEvalResult {
  /** Centipawns from White's perspective; mate encoded as ±(100000 - ply). */
  scoreCp: number;
  depth: number;
}

const WORKER_URL = '/stockfish/stockfish.js';

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private queue: Promise<void> = Promise.resolve();
  private listeners: Array<(line: string) => void> = [];

  async init(): Promise<void> {
    if (this.worker) return;
    this.worker = new Worker(WORKER_URL);
    this.worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data);
      this.listeners.forEach((l) => l(line));
    };
    await this.sendAndWait('uci', (l) => l === 'uciok');
    await this.sendAndWait('isready', (l) => l === 'readyok');
    this.ready = true;
  }

  private onLine(fn: (line: string) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== fn);
    };
  }

  private post(cmd: string): void {
    this.worker?.postMessage(cmd);
  }

  private sendAndWait(cmd: string, pred: (line: string) => boolean, timeoutMs = 15_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        off();
        reject(new Error(`Stockfish timeout: ${cmd}`));
      }, timeoutMs);
      const off = this.onLine((line) => {
        if (pred(line)) {
          window.clearTimeout(timer);
          off();
          resolve(line);
        }
      });
      this.post(cmd);
    });
  }

  /** Serialize UCI commands so searches don't interleave. */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async setSkill(skill: number): Promise<void> {
    await this.enqueue(async () => {
      await this.init();
      const s = Math.max(0, Math.min(20, Math.round(skill)));
      this.post('setoption name UCI_LimitStrength value true');
      // Skill Level works on many builds; also set Elo when supported
      this.post(`setoption name Skill Level value ${s}`);
      const elo = 800 + s * 60;
      this.post(`setoption name UCI_Elo value ${elo}`);
      await this.sendAndWait('isready', (l) => l === 'readyok');
    });
  }

  async getBestMove(fen: string, movetimeMs: number): Promise<EngineMoveResult> {
    return this.enqueue(async () => {
      await this.init();
      const mt = Math.max(50, Math.min(5000, Math.round(movetimeMs)));
      this.post('ucinewgame');
      this.post(`position fen ${fen}`);
      let best = '0000';
      let ponder: string | undefined;
      const done = new Promise<EngineMoveResult>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          off();
          reject(new Error('bestmove timeout'));
        }, mt + 8000);
        const off = this.onLine((line) => {
          if (line.startsWith('bestmove')) {
            window.clearTimeout(timer);
            off();
            const parts = line.split(/\s+/);
            best = parts[1] || '0000';
            if (parts[2] === 'ponder' && parts[3]) ponder = parts[3];
            resolve({ bestMove: best, ponder });
          }
        });
      });
      this.post(`go movetime ${mt}`);
      return done;
    });
  }

  async evaluate(fen: string, depth = 12): Promise<EngineEvalResult> {
    return this.enqueue(async () => {
      await this.init();
      const d = Math.max(4, Math.min(18, depth));
      this.post(`position fen ${fen}`);
      let scoreCp = 0;
      let gotDepth = 0;
      const done = new Promise<EngineEvalResult>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          off();
          resolve({ scoreCp, depth: gotDepth });
        }, 10_000);
        const off = this.onLine((line) => {
          if (line.startsWith('info ') && line.includes(' score ')) {
            const mMate = /score mate (-?\d+)/.exec(line);
            const mCp = /score cp (-?\d+)/.exec(line);
            const mDepth = / depth (\d+)/.exec(line);
            if (mDepth) gotDepth = Number(mDepth[1]);
            if (mMate) {
              const mate = Number(mMate[1]);
              scoreCp = mate > 0 ? 100000 - mate : -100000 - mate;
            } else if (mCp) {
              scoreCp = Number(mCp[1]);
            }
          }
          if (line.startsWith('bestmove')) {
            window.clearTimeout(timer);
            off();
            resolve({ scoreCp, depth: gotDepth });
          }
        });
      });
      this.post(`go depth ${d}`);
      return done;
    });
  }

  dispose(): void {
    try {
      this.post('quit');
    } catch {
      /* ignore */
    }
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.listeners = [];
  }

  get isReady(): boolean {
    return this.ready;
  }
}

export const uciToFromTo = (uci: string): { from: string; to: string; promotion?: string } | null => {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return null;
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4],
  };
};
