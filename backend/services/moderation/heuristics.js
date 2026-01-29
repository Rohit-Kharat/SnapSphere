const URL_REGEX = /(https?:\/\/|www\.)\S+/gi;

export function runHeuristics(text) {
  const t = String(text || "").trim();
  let score = 0;
  const reasons = [];

  const links = t.match(URL_REGEX)?.length || 0;
  if (links >= 1) { score += 30; reasons.push("has_link"); }
  if (links >= 2) { score += 50; reasons.push("many_links"); }

  if (/(.)\1{6,}/.test(t)) { score += 20; reasons.push("repeated_chars"); }

  const letters = t.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 12) {
    const caps = letters.replace(/[^A-Z]/g, "").length;
    const ratio = caps / letters.length;
    if (ratio > 0.7) { score += 15; reasons.push("caps_spam"); }
  }

  if (/(\b\w+\b)(\s+\1){6,}/i.test(t)) { score += 25; reasons.push("repeated_words"); }

  return { heuristicScore: score, heuristicReasons: reasons };
}
