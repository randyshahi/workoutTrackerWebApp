/**
 * Data layer: localStorage for workouts and custom exercises, plus derived exercise/workout helpers.
 */

import {
  STORAGE_KEY,
  CUSTOM_EXERCISES_KEY,
  COMMON_EXERCISES,
  BODY_PARTS,
  EXERCISE_TO_BODY_PART,
  BODY_PART_IDS
} from './constants.js';

// --- Storage ---

export function getWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function getCustomExercises() {
  try {
    const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (typeof item === 'string') {
        return { name: item, bodyPart: getBodyPartForExerciseKeywordOnly(item) };
      }
      return {
        name: (item && item.name) ? String(item.name).trim() : '',
        bodyPart: BODY_PART_IDS.includes(item.bodyPart) ? item.bodyPart : getBodyPartForExerciseKeywordOnly(item && item.name)
      };
    }).filter((item) => item.name.length > 0);
  } catch {
    return [];
  }
}

// --- Exercise / body part resolution ---

export function getBodyPartForExerciseKeywordOnly(name) {
  const key = (name || '').trim().toLowerCase();
  if (EXERCISE_TO_BODY_PART[key]) return EXERCISE_TO_BODY_PART[key];
  if (/bench|press|fly|pec|push-up|dip/i.test(key)) return 'chest';
  if (/squat|leg|lunges|lunge|deadlift|calf/i.test(key)) return 'legs';
  if (/row|pull|pulldown|lat|shrug|face pull/i.test(key)) return 'back';
  if (/shoulder|raise|press/i.test(key)) return 'shoulders';
  if (/curl|tricep|bicep|arm/i.test(key)) return 'arms';
  if (/plank|crunch|core|ab|twist/i.test(key)) return 'core';
  return null;
}

export function getBodyPartForExercise(exerciseName) {
  const trimmed = (exerciseName || '').trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  const custom = getCustomExercises();
  const customMatch = custom.find((e) => e.name.toLowerCase() === key);
  if (customMatch && customMatch.bodyPart) return customMatch.bodyPart;
  if (EXERCISE_TO_BODY_PART[key]) return EXERCISE_TO_BODY_PART[key];
  return getBodyPartForExerciseKeywordOnly(trimmed);
}

export function addCustomExercise(name, bodyPart) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  const part = bodyPart && BODY_PART_IDS.includes(bodyPart) ? bodyPart : getBodyPartForExerciseKeywordOnly(trimmed);
  const custom = getCustomExercises();
  const rest = custom.filter((e) => e.name.toLowerCase() !== trimmed.toLowerCase());
  const updated = [...rest, { name: trimmed, bodyPart: part }];
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
}

export function getAllExerciseNames() {
  const custom = getCustomExercises();
  const names = custom.map((e) => e.name);
  return [...new Set([...COMMON_EXERCISES, ...names])].sort((a, b) => a.localeCompare(b));
}

// --- Workout aggregates ---

export function getBodyPartsForWorkout(workout) {
  const parts = new Set();
  (workout.exercises || []).forEach((ex) => {
    const part = getBodyPartForExercise(ex.name);
    if (part) parts.add(part);
  });
  return parts;
}

export function getWorkoutsByDate() {
  const byDate = new Map();
  getWorkouts().forEach((w) => {
    const parts = getBodyPartsForWorkout(w);
    if (parts.size > 0) {
      const existing = byDate.get(w.date) || new Set();
      parts.forEach((p) => existing.add(p));
      byDate.set(w.date, existing);
    }
  });
  return byDate;
}

export function getWorkoutByDate(dateStr) {
  return getWorkouts().find((w) => w.date === dateStr) || null;
}

// Re-export for views that need them
export { BODY_PARTS, COMMON_EXERCISES };
