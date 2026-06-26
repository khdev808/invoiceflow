/** Failed attempts before a 15-minute account lock */
export const TEMP_LOCK_THRESHOLD = 5;

/** Failed attempts before permanent account block */
export const PERM_LOCK_THRESHOLD = 12;

/** Temporary lock duration in minutes */
export const TEMP_LOCK_MINUTES = 15;

/** IP failures in window before temporary IP block */
export const IP_TEMP_THRESHOLD = 15;

/** IP block duration in hours */
export const IP_BLOCK_HOURS = 24;

/** Rolling window for IP failure counting (minutes) */
export const IP_FAILURE_WINDOW_MINUTES = 60;
