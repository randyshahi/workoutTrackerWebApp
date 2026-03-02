/**
 * App-wide constants: storage keys, exercise lists, body parts, calendar labels.
 */

export const STORAGE_KEY = 'workout-tracker-workouts';
export const CUSTOM_EXERCISES_KEY = 'workout-tracker-custom-exercises';

export const COMMON_EXERCISES = [
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press',
  'Squat', 'Front Squat', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Lunges',
  'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift',
  'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise',
  'Barbell Row', 'Dumbbell Row', 'Pull-up', 'Lat Pulldown', 'T-Bar Row',
  'Barbell Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Pushdown', 'Skull Crusher',
  'Cable Fly', 'Pec Deck', 'Face Pull', 'Shrugs', 'Calf Raise',
  'Push-up', 'Dip', 'Plank', 'Crunch', 'Russian Twist'
];

export const BODY_PARTS = {
  chest: { label: 'Chest', color: '#5b8ddb' },
  legs: { label: 'Legs', color: '#d65c5c' },
  back: { label: 'Back', color: '#6bb56b' },
  shoulders: { label: 'Shoulders', color: '#d4a84b' },
  arms: { label: 'Arms', color: '#9b7dd4' },
  core: { label: 'Core', color: '#d4824a' }
};

export const EXERCISE_TO_BODY_PART = {
  'bench press': 'chest', 'incline bench press': 'chest', 'decline bench press': 'chest',
  'dumbbell bench press': 'chest', 'cable fly': 'chest', 'pec deck': 'chest', 'push-up': 'chest',
  'squat': 'legs', 'front squat': 'legs', 'leg press': 'legs', 'leg extension': 'legs',
  'leg curl': 'legs', 'lunges': 'legs', 'deadlift': 'legs', 'romanian deadlift': 'legs',
  'sumo deadlift': 'legs', 'calf raise': 'legs',
  'barbell row': 'back', 'dumbbell row': 'back', 'pull-up': 'back', 'lat pulldown': 'back',
  't-bar row': 'back', 'face pull': 'back', 'shrugs': 'back',
  'overhead press': 'shoulders', 'dumbbell shoulder press': 'shoulders',
  'lateral raise': 'shoulders', 'front raise': 'shoulders',
  'barbell curl': 'arms', 'hammer curl': 'arms', 'preacher curl': 'arms',
  'tricep pushdown': 'arms', 'skull crusher': 'arms', 'dip': 'arms',
  'plank': 'core', 'crunch': 'core', 'russian twist': 'core'
};

export const BODY_PART_IDS = Object.keys(BODY_PARTS);

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
