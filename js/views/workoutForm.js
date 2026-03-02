/**
 * Workout log form: date picker, add exercise, collect and save workout.
 */

import { getWorkouts, saveWorkouts, addCustomExercise, COMMON_EXERCISES } from '../data.js';
import { initDatePicker, renderDatePicker, updateDatePickerTriggerLabel } from '../components/datePicker.js';
import { createExerciseBlock } from '../components/exerciseBlock.js';
import { renderWorkouts } from './workoutsList.js';
import { renderCalendar } from './calendar.js';

function collectFormWorkout() {
  let date = document.getElementById('date').value.trim();
  if (!date) {
    date = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = date;
    updateDatePickerTriggerLabel();
  }
  const exercises = [];
  document.querySelectorAll('.exercise-block').forEach((block) => {
    const nameInput = block.querySelector('.exercise-name');
    const name = nameInput && nameInput.value.trim();
    if (!name) return;

    const sets = [];
    block.querySelectorAll('.log-set-row').forEach((row) => {
      const repsEl = row.querySelector('.log-set-reps');
      const weightEl = row.querySelector('.log-set-weight');
      const rpeEl = row.querySelector('.log-set-rpe');
      const reps = repsEl ? repsEl.textContent.trim() : '';
      const weightStr = weightEl ? weightEl.textContent.trim() : '';
      if (!reps) return;
      const rpeVal = rpeEl && rpeEl.value ? parseInt(rpeEl.value, 10) : null;
      sets.push({
        reps: parseInt(reps, 10),
        weight: weightStr && weightStr !== '—' ? parseFloat(weightStr) : null,
        rpe: rpeVal >= 1 && rpeVal <= 10 ? rpeVal : null
      });
    });
    if (sets.length > 0) {
      exercises.push({ name, sets });
    }
  });

  return { date, exercises };
}

function resetForm(createBlock) {
  const container = document.getElementById('exercises-container');
  container.innerHTML = '';
  container.appendChild(createBlock());
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('date').value = today;
  renderDatePicker(today);
}

export function initForm(deps) {
  const { openEditViewForBlock, closeEditView } = deps;
  const createBlock = () => createExerciseBlock({ onEdit: openEditViewForBlock, onCloseEdit: closeEditView });

  const form = document.getElementById('workout-form');
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('date').value = today;
  initDatePicker();
  initAddNewExercise();

  document.getElementById('add-exercise-btn').addEventListener('click', () => {
    document.getElementById('exercises-container').appendChild(createBlock());
  });

  document.getElementById('exercises-container').appendChild(createBlock());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { date, exercises } = collectFormWorkout();
    if (exercises.length === 0) {
      const msg = document.getElementById('workout-form-message');
      if (msg) {
        msg.textContent = 'Add at least one exercise and save at least one set (click Save) before saving the workout.';
        msg.classList.remove('hidden');
      }
      return;
    }
    const msg = document.getElementById('workout-form-message');
    if (msg) msg.classList.add('hidden');

    exercises.forEach((ex) => {
      if (ex.name && !COMMON_EXERCISES.includes(ex.name)) {
        addCustomExercise(ex.name);
      }
    });

    const workouts = getWorkouts();
    const newWorkout = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date,
      exercises
    };
    workouts.push(newWorkout);
    saveWorkouts(workouts);
    renderWorkouts();
    renderCalendar();
    resetForm(createBlock);
  });
}

function initAddNewExercise() {
  const toggle = document.getElementById('add-new-exercise-toggle');
  const formEl = document.getElementById('add-new-exercise-form');
  const nameInput = document.getElementById('new-exercise-name');
  const bodyPartSelect = document.getElementById('new-exercise-body-part');
  const saveBtn = document.getElementById('add-new-exercise-save');
  if (!toggle || !formEl || !nameInput || !bodyPartSelect || !saveBtn) return;

  toggle.addEventListener('click', () => {
    formEl.classList.toggle('add-new-exercise-form--closed');
  });

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const bodyPart = bodyPartSelect.value;
    addCustomExercise(name, bodyPart);
    nameInput.value = '';
    formEl.classList.add('add-new-exercise-form--closed');
  });
}
