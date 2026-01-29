export function decideModeration({ heuristicScore, heuristicReasons, aiFlagged, aiScores }) {
  const SHADOW_HEURISTIC = 70;
  const QUEUE_HEURISTIC = 35;

  // tweak thresholds after you see real data
  const HARD_REJECT = 0.85;
  const QUEUE = 0.55;

  const maxScore = Math.max(0, ...Object.values(aiScores || {}).map(Number));

  if (heuristicScore >= SHADOW_HEURISTIC) {
    return { decision: "shadow", status: "shadow", reason: `heuristics:${heuristicReasons.join(",")}` };
  }

  if (aiFlagged && maxScore >= HARD_REJECT) {
    return { decision: "reject", status: "rejected", reason: "ai:severe" };
  }

  if (aiFlagged || maxScore >= QUEUE || heuristicScore >= QUEUE_HEURISTIC) {
    return { decision: "queue", status: "flagged", reason: "needs_review" };
  }

  return { decision: "allow", status: "approved", reason: "clean" };
}
