// The whole game's feel lives in this file (spec §1).
// No component may use an inline duration, delay, or easing.

export const SHIP_ARRIVE_MS = 2600;
export const SHIP_DEPART_MS = 2200;
export const DEPART_BEAT_MS = 1100; // stillness between loss and the horn
export const CRANE_SWAY_MS = 2600;
export const CRANE_DROP_ANTICIPATION_MS = 140;
export const BOT_THINK_MS = 700;
export const SWING_PERIOD_MS = 2200;
export const BIRD_STARTLE_MIN_MS = 80;
export const BIRD_STARTLE_MAX_MS = 120;
export const BIRD_SCATTER_MS = 700;
export const BIRD_RETURN_MIN_MS = 1800;
export const BIRD_RETURN_SPAN_MS = 2600;
export const BIRD_HOP_MS = 220;
export const BIRD_FLAP_MS = 150;
export const BIRD_IDLE_MIN_MS = 2400;
export const BIRD_IDLE_SPAN_MS = 4200;
export const OVERLAY_IN_MS = 450;
export const CLOUD_DRIFT_MS = 42000;
export const SHIMMER_MS = 5200;
export const LAMP_BLINK_MS = 3400;
export const RAIN_NEAR_MS = 700;
export const RAIN_FAR_MS = 1100;
export const WAVE_NEAR_MS = 8000;
export const WAVE_FAR_MS = 13000;
export const STAR_TWINKLE_MS = 2800;

export const EASE_ARRIVE = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_DEPART = 'cubic-bezier(0.7, 0, 0.84, 0)';
export const EASE_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
