// Transcribed from the supplied paper Tables 4 and 5.
// Columns: non-reactive (RouteDS, SDC, PLCA, PLCS, Eff., Comf.),
// reactive (same order), then NAVSIM PDMS. Strings preserve printed precision.
export const baselineGroups = [
  {
    label: 'Vision-based planners',
    planners: [
      { name: 'LTF', without: '16.2 51 66.0 50.3 63.9 100 16.3 54 63.5 49.1 76.1 99 83.8', with: '20.1 95 57.1 56.1 68.2 96 23.0 93 53.6 52.6 78.0 93 85.6' },
      { name: 'DiffusionDrive', without: '25.6 59 78.8 63.7 61.4 100 24.2 59 77.0 63.1 75.7 100 85.8', with: '35.9 100 82.0 80.5 63.4 99 41.0 100 81.2 80.2 71.5 99 86.9' },
      { name: 'DrivoR', without: '20.6 50 75.5 62.8 104.7 44 25.5 53 76.6 62.8 133.4 47 93.1', with: '36.5 90 72.8 66.0 84.5 60 41.4 89 71.8 66.0 107.4 64 92.2' },
      { name: 'SafeDrive', without: '27.5 41 79.3 63.7 69.4 47 30.4 45 78.8 62.8 86.3 40 90.8', with: '44.4 82 75.0 69.8 68.3 44 48.9 79 73.8 69.5 81.3 49 90.6' },
    ],
  },
  {
    label: 'VLA-based planners',
    planners: [
      { name: 'ReCogDrive', without: '15.4 71 75.7 59.0 76.9 100 20.3 62 77.1 58.7 93.7 99 90.8', with: '21.5 83 74.4 55.8 59.3 98 26.3 84 75.6 56.7 75.5 98 90.4' },
    ],
  },
];

export const scoringGroups = [
  {
    label: 'SafeDrive',
    rows: [
      { name: 'Safety Scoring', values: '44.4 82 75.0 69.8 68.3 44 48.9 79 73.8 69.5 81.3 49 90.6' },
      { name: 'IL Scoring', values: '53.9 95 77.1 74.4 66.5 100 55.3 94 78.0 74.4 75.7 100 89.5' },
      { name: 'IL Scoring + Safety Filtering', values: '54.4 96 76.7 72.7 65.3 100 56.1 96 77.7 74.1 78.3 100 89.5' },
    ],
  },
  {
    label: 'ReCogDrive',
    rows: [
      { name: 'IL + GRPO Fine-tuning', values: '21.5 83 74.4 55.8 59.3 98 26.3 84 75.6 56.7 75.5 98 90.4' },
      { name: 'IL only', values: '37.7 97 79.4 73.8 58.9 100 42.3 96 79.6 75.0 70.4 100 86.8' },
    ],
  },
];
