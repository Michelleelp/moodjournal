// Load Transformers.js from the pinned CDN build and reuse one classifier pipeline.
const TRANSFORMERS_MODULE_URL = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";
const MODEL_NAME = "MicahB/emotion_text_classifier";
const EMOTION_LABELS = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"];

let emotionPipelinePromise;

async function getEmotionPipeline() {
  if (!emotionPipelinePromise) {
    emotionPipelinePromise = import(TRANSFORMERS_MODULE_URL)
      .then(({ pipeline, env }) => {
        // Use the public model repository instead of looking for a local models folder.
        env.allowLocalModels = false;
        return pipeline("text-classification", MODEL_NAME);
      })
      .catch((error) => {
        emotionPipelinePromise = undefined;
        throw error;
      });
  }

  return emotionPipelinePromise;
}

// Expose model warmup separately so the journal can start downloading in the background.
export async function loadEmotionModel() {
  await getEmotionPipeline();
}

// Return the highest-scoring mood together with scores for every supported label.
export async function detectEmotion(text) {
  try {
    const cleanedText = typeof text === "string" ? text.trim() : "";
    if (!cleanedText) {
      throw new TypeError("Emotion detection requires non-empty text.");
    }

    const classifier = await getEmotionPipeline();
    const output = await classifier(cleanedText, { topk: null });
    const predictions = Array.isArray(output) ? output.flat(Infinity) : [output];
    const scores = Object.fromEntries(EMOTION_LABELS.map((label) => [label, null]));

    for (const prediction of predictions) {
      const label = typeof prediction.label === "string" ? prediction.label.toLowerCase() : "";
      const score = Number(prediction.score);
      if (Object.prototype.hasOwnProperty.call(scores, label) && Number.isFinite(score)) {
        scores[label] = score;
      }
    }

    const missingLabels = EMOTION_LABELS.filter((label) => scores[label] === null);
    if (missingLabels.length > 0) {
      throw new Error(`Emotion model omitted scores for: ${missingLabels.join(", ")}.`);
    }

    const label = EMOTION_LABELS.reduce((highest, current) =>
      scores[current] > scores[highest] ? current : highest
    );
    return { label, scores };
  } catch (error) {
    console.error("[MoodJournal] Hugging Face emotion detection failed.", error);
    throw error;
  }
}
