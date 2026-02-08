export type TrainingLevel = "words" | "phrases" | "sentences" | "paragraphs";

export interface FearedWordEntry {
  id: string;
  word: string;
  difficulty: "easy" | "medium" | "hard";
  practiceCount: number;
  mastered: boolean;
  createdAt: string;
  lastPracticed: string | null;
  levelProgress: Record<TrainingLevel, { practiceCount: number; completed: boolean }>;
}

export interface GeneratedContent {
  wordId: string;
  word: string;
  phrases: string[];
  sentences: string[];
  paragraphs: string[];
  generatedAt: string;
}

export interface FearedWordsStore {
  words: FearedWordEntry[];
  generatedContent: Record<string, GeneratedContent>;
}

const STORAGE_KEY = "stutterlab_feared_words";
const LEVEL_COMPLETION_THRESHOLD = 3;

const DEFAULT_LEVEL_PROGRESS: FearedWordEntry["levelProgress"] = {
  words: { practiceCount: 0, completed: false },
  phrases: { practiceCount: 0, completed: false },
  sentences: { practiceCount: 0, completed: false },
  paragraphs: { practiceCount: 0, completed: false },
};

/* ─── Read / Write ─── */

export function getFearedWordsStore(): FearedWordsStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FearedWordsStore;
  } catch {
    return null;
  }
}

function getOrCreateStore(): FearedWordsStore {
  return getFearedWordsStore() || { words: [], generatedContent: {} };
}

export function saveFearedWordsStore(store: FearedWordsStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/* ─── CRUD ─── */

export function addFearedWord(word: string, difficulty: "easy" | "medium" | "hard" = "medium"): FearedWordEntry {
  const store = getOrCreateStore();
  const entry: FearedWordEntry = {
    id: Date.now().toString(),
    word: word.trim().toLowerCase(),
    difficulty,
    practiceCount: 0,
    mastered: false,
    createdAt: new Date().toISOString(),
    lastPracticed: null,
    levelProgress: structuredClone(DEFAULT_LEVEL_PROGRESS),
  };
  store.words.push(entry);
  saveFearedWordsStore(store);
  return entry;
}

export function removeFearedWord(id: string): void {
  const store = getOrCreateStore();
  store.words = store.words.filter((w) => w.id !== id);
  delete store.generatedContent[id];
  saveFearedWordsStore(store);
}

export function toggleMastered(id: string): void {
  const store = getOrCreateStore();
  const word = store.words.find((w) => w.id === id);
  if (word) {
    word.mastered = !word.mastered;
    saveFearedWordsStore(store);
  }
}

export function recordPractice(id: string, level: TrainingLevel): void {
  const store = getOrCreateStore();
  const word = store.words.find((w) => w.id === id);
  if (!word) return;

  word.practiceCount += 1;
  word.lastPracticed = new Date().toISOString();

  const lp = word.levelProgress[level];
  lp.practiceCount += 1;
  if (lp.practiceCount >= LEVEL_COMPLETION_THRESHOLD) {
    lp.completed = true;
  }

  // Auto-master when all levels are completed
  const allDone = (Object.values(word.levelProgress) as { completed: boolean }[]).every((l) => l.completed);
  if (allDone) {
    word.mastered = true;
  }

  saveFearedWordsStore(store);
}

/* ─── Queries ─── */

export function getActiveWords(): FearedWordEntry[] {
  const store = getFearedWordsStore();
  if (!store) return [];
  return store.words
    .filter((w) => !w.mastered)
    .sort((a, b) => a.practiceCount - b.practiceCount);
}

export function getAllWords(): FearedWordEntry[] {
  const store = getFearedWordsStore();
  if (!store) return [];
  return store.words;
}

const TRAINING_LEVELS: TrainingLevel[] = ["words", "phrases", "sentences", "paragraphs"];

export function getCurrentTrainingLevel(word: FearedWordEntry): TrainingLevel {
  for (const level of TRAINING_LEVELS) {
    if (!word.levelProgress[level].completed) {
      return level;
    }
  }
  return "paragraphs"; // All done — keep practicing at highest level
}

export function getTrainingItems(wordId: string, level: TrainingLevel): string[] {
  const store = getFearedWordsStore();
  if (!store) return [];

  const word = store.words.find((w) => w.id === wordId);
  if (!word) return [];

  // Word level: just the word itself
  if (level === "words") {
    return [word.word];
  }

  // Other levels: pull from cached AI-generated content
  const content = store.generatedContent[wordId];
  if (!content) {
    // Fallback if content hasn't been generated yet
    return getFallbackContent(word.word, level);
  }

  return content[level] || getFallbackContent(word.word, level);
}

function getFallbackContent(word: string, level: TrainingLevel): string[] {
  switch (level) {
    case "phrases":
      return [`say ${word}`, `the word ${word}`, `about ${word}`];
    case "sentences":
      return [
        `I can say the word ${word} with confidence.`,
        `Let me practice saying ${word} out loud.`,
        `The word ${word} is becoming easier for me.`,
      ];
    case "paragraphs":
      return [
        `Today I am practicing the word ${word}. Every time I say ${word}, I feel more confident. Using my techniques, ${word} is becoming a word I can say smoothly and naturally.`,
      ];
    default:
      return [word];
  }
}

/* ─── Generated Content Cache ─── */

export function cacheGeneratedContent(wordId: string, content: GeneratedContent): void {
  const store = getOrCreateStore();
  store.generatedContent[wordId] = content;
  saveFearedWordsStore(store);
}

export function getGeneratedContent(wordId: string): GeneratedContent | null {
  const store = getFearedWordsStore();
  if (!store) return null;
  return store.generatedContent[wordId] || null;
}
