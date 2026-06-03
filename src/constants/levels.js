// WhatsApp-status thresholds for each reward level.
// Mirror of backend/src/utils/rewardEngine.js (statuses column).
export const LEVELS = [
  { index: 1, name: 'First Referral Knowledge', statuses: 1 },
  { index: 2, name: 'Bronze Knowledge', statuses: 5 },
  { index: 3, name: 'Silver Knowledge', statuses: 20 },
  { index: 4, name: 'Gold Knowledge', statuses: 30 },
  { index: 5, name: 'Platinum Knowledge', statuses: 40 },
  { index: 6, name: 'Knowledge Master', statuses: 50 },
  { index: 7, name: 'Knowledge Ambassador', statuses: 60 },
];

// number -> level reached at exactly that status count
export const LEVEL_BY_STATUS = Object.fromEntries(LEVELS.map((l) => [l.statuses, l]));
