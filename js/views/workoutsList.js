/**
 * Workouts list view: renders saved workouts and delete buttons.
 */

import { getWorkouts, saveWorkouts } from '../data.js';
import { formatDate, escapeHtml } from '../helpers.js';
import { renderCalendar } from './calendar.js';

export function renderWorkouts() {
  const list = document.getElementById('workout-list');
  if (!list) return;
  const emptyState = document.getElementById('empty-state');
  const workouts = getWorkouts();

  list.innerHTML = '';

  if (workouts.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  workouts
    .slice()
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .forEach((workout) => {
      const exercisesHtml = workout.exercises
        .map(
          (ex) => `
            <div class="workout-exercise">
              <span class="workout-exercise-name">${escapeHtml(ex.name)}</span>
              <ul class="workout-sets">
                ${ex.sets
                  .map(
                    (s) =>
                      `<li>${s.reps} reps${s.weight != null ? ` @ ${s.weight} kg` : ''}${s.rpe != null ? ` · RPE ${s.rpe}` : ''}</li>`
                  )
                  .join('')}
              </ul>
            </div>
          `
        )
        .join('');
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <span class="workout-date">${formatDate(workout.date)}</span>
          <div class="workout-exercises-list">${exercisesHtml}</div>
        </div>
        <button type="button" class="delete-btn" data-id="${escapeHtml(workout.id)}" aria-label="Delete workout">Delete</button>
      `;

      li.querySelector('.delete-btn').addEventListener('click', () => {
        const current = getWorkouts();
        const toRemove = current.find((w) => w.id === workout.id);
        if (toRemove) {
          saveWorkouts(current.filter((w) => w !== toRemove));
          renderWorkouts();
          renderCalendar();
        }
      });

      list.appendChild(li);
    });
}
