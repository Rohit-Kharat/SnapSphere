import axios from "axios";

const DEFAULT_MODEL = process.env.HF_TOXIC_MODEL || "unitary/toxic-bert";

// ✅ NEW endpoint (router)
const HF_URL = (model) => `https://router.huggingface.co/hf-inference/models/${model}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runHuggingFaceModeration(text) {
  const token = process.env.HF_API_TOKEN;

  if (!token) {
    return {
      aiProvider: "huggingface",
      aiModel: DEFAULT_MODEL,
      aiFlagged: false,
      aiCategories: {},
      aiScores: {},
    };
  }

  const call = async () => {
    const res = await axios.post(
      HF_URL(DEFAULT_MODEL),
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );
    return res.data;
  };

  let data;
  try {
    data = await call();
  } catch (e) {
    const status = e?.response?.status;
    const estimated = e?.response?.data?.estimated_time;

    // If model is loading, HF may return 503
    if (status === 503 && typeof estimated === "number") {
      await sleep(Math.min(estimated * 1000, 4000));
      data = await call();
    } else {
      // ✅ Fail-safe: don't break comments if HF fails
      console.log("HF moderation failed:", e?.response?.data || e.message);
      return {
        aiProvider: "huggingface",
        aiModel: DEFAULT_MODEL,
        aiFlagged: false,
        aiCategories: {},
        aiScores: {},
      };
    }
  }

  // normalize output
  const arr = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;

  const scores = {};
  const categories = {};

  for (const item of arr || []) {
    const label = String(item.label || "").toLowerCase();
    const score = Number(item.score || 0);
    scores[label] = score;
    categories[label] = score >= 0.5;
  }

  const toxicScore = scores["toxic"] ?? Math.max(0, ...Object.values(scores).map(Number));
  const aiFlagged = toxicScore >= 0.7;

  return {
    aiProvider: "huggingface",
    aiModel: DEFAULT_MODEL,
    aiFlagged,
    aiCategories: categories,
    aiScores: scores,
  };
}
