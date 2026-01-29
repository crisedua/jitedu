// Application constants
export const VIDEO_STATUSES = {
  PENDING: 'pending',
  EXTRACTING_TRANSCRIPT: 'extracting_transcript',
  NO_TRANSCRIPT: 'no_transcript',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export const TECHNIQUE_CATEGORIES = {
  CONVERSION: 'conversion',
  CREDIBILITY: 'credibility',
  ENGAGEMENT: 'engagement',
  AWARENESS: 'awareness'
};

export const FUNNEL_STAGES = {
  AWARENESS: 'awareness',
  CONSIDERATION: 'consideration',
  CONVERSION: 'conversion',
  RETENTION: 'retention'
};

export const ANALYSIS_DEPTHS = {
  QUICK: 'quick',
  NORMAL: 'normal',
  DEEP: 'deep'
};

export const SUPPORTED_LANGUAGES = {
  ES: 'es',
  EN: 'en',
  AUTO: 'auto'
};

export const MAX_BATCH_SIZE = 50;
export const MIN_CONFIDENCE_THRESHOLD = 0.5;
export const MAX_CONFIDENCE_THRESHOLD = 1.0;

export const CATEGORY_COLORS = {
  [TECHNIQUE_CATEGORIES.CONVERSION]: 'bg-red-100 text-red-800',
  [TECHNIQUE_CATEGORIES.CREDIBILITY]: 'bg-blue-100 text-blue-800',
  [TECHNIQUE_CATEGORIES.ENGAGEMENT]: 'bg-green-100 text-green-800',
  [TECHNIQUE_CATEGORIES.AWARENESS]: 'bg-purple-100 text-purple-800'
};

export const STATUS_COLORS = {
  [VIDEO_STATUSES.COMPLETED]: 'badge-success',
  [VIDEO_STATUSES.ERROR]: 'badge-error',
  [VIDEO_STATUSES.NO_TRANSCRIPT]: 'badge-warning',
  [VIDEO_STATUSES.ANALYZING]: 'badge-info',
  [VIDEO_STATUSES.EXTRACTING_TRANSCRIPT]: 'badge-info',
  [VIDEO_STATUSES.PENDING]: 'badge-info'
};