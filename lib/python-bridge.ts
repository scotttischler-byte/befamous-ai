import { spawnSync } from "child_process";
import path from "path";
import type { PostForLearning } from "@/lib/learning-engine";
import type { WinningPatterns } from "@/lib/types";

/** Optional: run ml/engine.py when python3 is available (e.g. local dev). */
export function tryPythonWinningPatterns(
  posts: PostForLearning[]
): WinningPatterns | null {
  if (process.env.USE_PYTHON_ML !== "true") return null;
  const scriptPath = path.join(process.cwd(), "ml", "engine.py");
  const res = spawnSync("python3", [scriptPath], {
    input: JSON.stringify({ posts }),
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 20_000,
  });
  if (res.error || res.status !== 0 || !res.stdout) return null;
  try {
    const parsed = JSON.parse(res.stdout) as {
      winning_patterns?: WinningPatterns;
    };
    return parsed.winning_patterns ?? null;
  } catch {
    return null;
  }
}
