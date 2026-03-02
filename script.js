const STORAGE_KEY = 'workout-tracker-workouts';
const CUSTOM_EXERCISES_KEY = 'workout-tracker-custom-exercises';

const COMMON_EXERCISES = [
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press',
  'Squat', 'Front Squat', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Lunges',
  'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift',
  'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise',
  'Barbell Row', 'Dumbbell Row', 'Pull-up', 'Lat Pulldown', 'T-Bar Row',
  'Barbell Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Pushdown', 'Skull Crusher',
  'Cable Fly', 'Pec Deck', 'Face Pull', 'Shrugs', 'Calf Raise',
  'Push-up', 'Dip', 'Plank', 'Crunch', 'Russian Twist'
];

const BODY_PARTS = {
  chest: { label: 'Chest', color: '#5b8ddb' },
  legs: { label: 'Legs', color: '#d65c5c' },
  back: { label: 'Back', color: '#6bb56b' },
  shoulders: { label: 'Shoulders', color: '#d4a84b' },
  arms: { label: 'Arms', color: '#9b7dd4' },
  core: { label: 'Core', color: '#d4824a' }
};

const EXERCISE_TO_BODY_PART = {
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

function getBodyPartForExercise(exerciseName) {
  const trimmed = (exerciseName || '').trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  const custom = getCustomExercises();
  const customMatch = custom.find((e) => e.name.toLowerCase() === key);
  if (customMatch && customMatch.bodyPart) return customMatch.bodyPart;
  if (EXERCISE_TO_BODY_PART[key]) return EXERCISE_TO_BODY_PART[key];
  return getBodyPartForExerciseKeywordOnly(trimmed);
}

function getBodyPartsForWorkout(workout) {
  const parts = new Set();
  (workout.exercises || []).forEach((ex) => {
    const part = getBodyPartForExercise(ex.name);
    if (part) parts.add(part);
  });
  return parts;
}

function getWorkoutsByDate() {
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

function getWorkoutByDate(dateStr) {
  return getWorkouts().find((w) => w.date === dateStr) || null;
}

function showCalendarDayPreview(dateStr) {
  const container = document.getElementById('calendar-day-preview');
  const label = document.getElementById('calendar-day-preview-label');
  const content = document.getElementById('calendar-day-preview-content');
  if (!container || !label || !content) return;

  const workout = getWorkoutByDate(dateStr);
  const d = new Date(dateStr + 'T00:00:00');
  const dateLabel = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  label.textContent = dateLabel;

  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    content.innerHTML = '<p class="calendar-day-preview-empty">No workout logged for this day.</p>';
  } else {
    content.innerHTML = workout.exercises
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
  }

  container.hidden = false;
}

function getWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

const BODY_PART_IDS = Object.keys(BODY_PARTS);

function getCustomExercises() {
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

function getBodyPartForExerciseKeywordOnly(name) {
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

function addCustomExercise(name, bodyPart) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  const part = bodyPart && BODY_PART_IDS.includes(bodyPart) ? bodyPart : getBodyPartForExerciseKeywordOnly(trimmed);
  const custom = getCustomExercises();
  const existing = custom.find((e) => e.name.toLowerCase() === trimmed.toLowerCase());
  const rest = custom.filter((e) => e.name.toLowerCase() !== trimmed.toLowerCase());
  const updated = [...rest, { name: trimmed, bodyPart: part }];
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
}

function getAllExerciseNames() {
  const custom = getCustomExercises();
  const names = custom.map((e) => e.name);
  return [...new Set([...COMMON_EXERCISES, ...names])].sort((a, b) => a.localeCompare(b));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createExerciseAutocomplete() {
  const wrap = document.createElement('div');
  wrap.className = 'autocomplete-wrap';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'exercise-name';
  input.placeholder = 'e.g. Bench Press';
  input.setAttribute('autocomplete', 'off');
  const dropdown = document.createElement('div');
  dropdown.className = 'autocomplete-dropdown';
  dropdown.hidden = true;

  function filterOptions(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return getAllExerciseNames().slice(0, 15);
    return getAllExerciseNames()
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 15);
  }

  function showDropdown() {
    const options = filterOptions(input.value);
    dropdown.innerHTML = '';
    if (options.length === 0) {
      dropdown.hidden = true;
      return;
    }
    options.forEach((name) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'autocomplete-option';
      option.textContent = name;
      option.addEventListener('click', () => {
        input.value = name;
        dropdown.hidden = true;
        input.focus();
      });
      dropdown.appendChild(option);
    });
    dropdown.hidden = false;
  }

  function hideDropdown() {
    setTimeout(() => { dropdown.hidden = true; }, 150);
  }

  input.addEventListener('input', showDropdown);
  input.addEventListener('focus', showDropdown);
  input.addEventListener('blur', hideDropdown);
  wrap.appendChild(input);
  wrap.appendChild(dropdown);
  return wrap;
}

function formatSetSummary(weightStr, reps, rpeVal) {
  const parts = [];
  if (weightStr && weightStr !== '—') parts.push(weightStr + ' kg');
  parts.push(reps + ' reps');
  if (rpeVal >= 1 && rpeVal <= 10) parts.push('RPE ' + rpeVal);
  return parts.join(' and ');
}

function createExerciseBlock() {
  const block = document.createElement('div');
  block.className = 'exercise-block';
  const logSetsList = document.createElement('div');
  logSetsList.className = 'log-sets-list';

  block.innerHTML = `
    <div class="exercise-block-condensed" aria-hidden="false">
      <div class="condensed-header">
        <span class="condensed-name"></span>
        <span class="condensed-hint">Tap to edit sets</span>
      </div>
      <div class="condensed-sets"></div>
    </div>
    <div class="exercise-block-expanded" aria-hidden="true">
      <div class="exercise-header">
        <div class="exercise-name-wrap"></div>
        <button type="button" class="remove-exercise-btn" aria-label="Remove exercise">Remove</button>
      </div>
      <button type="button" class="back-to-condensed-btn" aria-label="Back to summary">← Back</button>
      <div class="log-entry">
        <div class="log-entry-row">
          <label class="log-entry-label">Weight (kg)</label>
          <div class="stepper log-entry-stepper">
            <button type="button" class="stepper-btn" data-step="-5" data-for="weight" aria-label="Decrease weight">−</button>
            <input type="number" min="0" step="0.5" value="" placeholder="0" class="log-entry-weight">
            <button type="button" class="stepper-btn" data-step="5" data-for="weight" aria-label="Increase weight">+</button>
          </div>
        </div>
        <div class="log-entry-row">
          <label class="log-entry-label">Reps</label>
          <div class="stepper log-entry-stepper">
            <button type="button" class="stepper-btn" data-step="-1" data-for="reps" aria-label="Decrease reps">−</button>
            <input type="number" min="1" max="999" value="10" placeholder="Reps" class="log-entry-reps">
            <button type="button" class="stepper-btn" data-step="1" data-for="reps" aria-label="Increase reps">+</button>
          </div>
        </div>
        <div class="log-entry-actions">
          <button type="button" class="log-save-btn">Save</button>
          <button type="button" class="log-clear-btn">Clear</button>
        </div>
      </div>
      <div class="log-sets-header">Sets so far</div>
      <div class="log-sets-table-header">
        <span class="log-set-col-num">Set</span>
        <span class="log-set-col-weight">Weight (kg)</span>
        <span class="log-set-col-reps">Reps</span>
        <span class="log-set-col-rpe">RPE</span>
        <span class="log-set-col-remove"></span>
      </div>
    </div>
  `;

  const condensedEl = block.querySelector('.exercise-block-condensed');
  const expandedEl = block.querySelector('.exercise-block-expanded');
  const condensedNameEl = block.querySelector('.condensed-name');
  const condensedSetsEl = block.querySelector('.condensed-sets');

  block.querySelector('.exercise-name-wrap').appendChild(createExerciseAutocomplete());
  block.querySelector('.exercise-name').setAttribute('required', 'required');
  expandedEl.appendChild(logSetsList);
  block.querySelector('.remove-exercise-btn').addEventListener('click', (e) => { e.stopPropagation(); block.remove(); });

  const weightInput = block.querySelector('.log-entry-weight');
  const repsInput = block.querySelector('.log-entry-reps');
  const nameInput = block.querySelector('.exercise-name');

  function refreshCondensed() {
    const name = nameInput && nameInput.value.trim();
    condensedNameEl.textContent = name || 'Exercise';
    const rows = logSetsList.querySelectorAll('.log-set-row');
    if (rows.length === 0) {
      condensedSetsEl.innerHTML = '<p class="condensed-sets-empty">No sets yet</p>';
      return;
    }
    condensedSetsEl.innerHTML = Array.from(rows)
      .map((row) => {
        const weightEl = row.querySelector('.log-set-weight');
        const repsEl = row.querySelector('.log-set-reps');
        const rpeEl = row.querySelector('.log-set-rpe');
        const weightStr = weightEl ? weightEl.textContent.trim() : '';
        const reps = repsEl ? repsEl.textContent.trim() : '';
        const rpeVal = rpeEl && rpeEl.value ? parseInt(rpeEl.value, 10) : null;
        return `<p class="condensed-set-line">${escapeHtml(formatSetSummary(weightStr, reps, rpeVal))}</p>`;
      })
      .join('');
  }

  function showCondensed() {
    refreshCondensed();
    condensedEl.classList.remove('exercise-block-panel--hidden');
    condensedEl.setAttribute('aria-hidden', 'false');
    expandedEl.classList.add('exercise-block-panel--hidden');
    expandedEl.setAttribute('aria-hidden', 'true');
  }

  function showExpanded() {
    condensedEl.classList.add('exercise-block-panel--hidden');
    condensedEl.setAttribute('aria-hidden', 'true');
    expandedEl.classList.remove('exercise-block-panel--hidden');
    expandedEl.setAttribute('aria-hidden', 'false');
  }

  block._showCondensed = showCondensed;

  condensedEl.addEventListener('click', () => openEditViewForBlock(block));
  block.querySelector('.back-to-condensed-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeEditView();
  });

  showCondensed();

  block.querySelectorAll('.log-entry .stepper-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => e.stopPropagation());
  });

  block.querySelectorAll('.log-entry .stepper-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step, 10);
      const forWhat = btn.dataset.for;
      if (forWhat === 'reps') {
        const v = parseInt(repsInput.value || '0', 10) + step;
        repsInput.value = Math.max(1, Math.min(999, v));
      } else {
        const v = parseFloat(weightInput.value || '0') + step;
        weightInput.value = v <= 0 ? '' : Math.max(0, v);
      }
    });
  });

  block.querySelector('.log-save-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const reps = repsInput.value.trim();
    if (!reps) return;
    const weight = weightInput.value.trim();
    const setNum = logSetsList.children.length + 1;
    const row = document.createElement('div');
    row.className = 'log-set-row';
    const rpeOptions = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      .map((v) => `<option value="${v}">${v || '—'}</option>`)
      .join('');
    row.innerHTML = `
      <span class="log-set-num">${setNum}</span>
      <span class="log-set-weight">${weight || '—'}</span>
      <span class="log-set-reps">${reps}</span>
      <select class="log-set-rpe" aria-label="RPE">${rpeOptions}</select>
      <button type="button" class="remove-set-btn" aria-label="Remove set">×</button>
    `;
    row.querySelector('.remove-set-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      row.remove();
      logSetsList.querySelectorAll('.log-set-row').forEach((r, i) => {
        const numEl = r.querySelector('.log-set-num');
        if (numEl) numEl.textContent = i + 1;
      });
    });
    logSetsList.appendChild(row);
    weightInput.value = weight || '';
    repsInput.value = reps;
  });

  block.querySelector('.log-clear-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    weightInput.value = '';
    repsInput.value = '10';
  });

  return block;
}

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

function ordinal(n) {
  const s = String(n);
  const last = s.slice(-1);
  const last2 = s.slice(-2);
  if (last2 === '11' || last2 === '12' || last2 === '13') return s + 'th';
  if (last === '1') return s + 'st';
  if (last === '2') return s + 'nd';
  if (last === '3') return s + 'rd';
  return s + 'th';
}

function formatDatePickerLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const day = d.getDate();
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  return `${month} ${ordinal(day)}, ${year} (${weekday})`;
}

function getDatePickerOptions() {
  const options = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let offset = 0; offset >= -21; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const value = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const label = formatDatePickerLabel(value);
    options.push({ value, label });
  }
  return options;
}

function openDatePicker() {
  const list = document.getElementById('date-picker-list');
  const trigger = document.getElementById('date-picker-trigger');
  if (list) list.classList.remove('date-picker-list--closed');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('date-picker-trigger--open');
  }
}

function closeDatePicker() {
  const list = document.getElementById('date-picker-list');
  const trigger = document.getElementById('date-picker-trigger');
  if (list) list.classList.add('date-picker-list--closed');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('date-picker-trigger--open');
  }
}

function updateDatePickerTriggerLabel() {
  const trigger = document.getElementById('date-picker-trigger');
  const dateInput = document.getElementById('date');
  if (!trigger || !dateInput || !dateInput.value) return;
  trigger.textContent = formatDatePickerLabel(dateInput.value);
}

function renderDatePicker(selectedValue) {
  const list = document.getElementById('date-picker-list');
  const dateInput = document.getElementById('date');
  const trigger = document.getElementById('date-picker-trigger');
  if (!list || !dateInput) return;

  const options = getDatePickerOptions();
  const valueToUse = selectedValue || new Date().toISOString().slice(0, 10);
  dateInput.value = valueToUse;
  updateDatePickerTriggerLabel();

  list.innerHTML = '';
  options.forEach((opt) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.role = 'option';
    option.className = 'date-picker-option';
    if (opt.value === valueToUse) option.classList.add('date-picker-option--selected');
    option.dataset.value = opt.value;
    option.textContent = opt.label;
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      dateInput.value = opt.value;
      updateDatePickerTriggerLabel();
      list.querySelectorAll('.date-picker-option').forEach((o) => o.classList.remove('date-picker-option--selected'));
      option.classList.add('date-picker-option--selected');
      closeDatePicker();
    });
    list.appendChild(option);
  });

  const selected = list.querySelector('.date-picker-option--selected');
  if (selected) selected.scrollIntoView({ block: 'nearest', behavior: 'auto' });
}

function initDatePicker() {
  renderDatePicker();

  const trigger = document.getElementById('date-picker-trigger');
  const list = document.getElementById('date-picker-list');
  if (!trigger || !list) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = list.classList.contains('date-picker-list--closed');
    if (isClosed) openDatePicker();
    else closeDatePicker();
  });

  document.addEventListener('click', () => closeDatePicker());
  list.addEventListener('click', (e) => e.stopPropagation());
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

function resetForm() {
  const container = document.getElementById('exercises-container');
  container.innerHTML = '';
  container.appendChild(createExerciseBlock());
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('date').value = today;
  renderDatePicker(today);
}

function initForm() {
  const form = document.getElementById('workout-form');
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('date').value = today;
  initDatePicker();
  initAddNewExercise();

  document.getElementById('add-exercise-btn').addEventListener('click', () => {
    document.getElementById('exercises-container').appendChild(createExerciseBlock());
  });

  document.getElementById('exercises-container').appendChild(createExerciseBlock());

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
    if (typeof renderCalendar === 'function') renderCalendar();
    resetForm();
  });
}

function renderWorkouts() {
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
          if (typeof renderCalendar === 'function') renderCalendar();
        }
      });

      list.appendChild(li);
    });
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarState() {
  let month = parseInt(sessionStorage.getItem('calendar-month'), 10);
  let year = parseInt(sessionStorage.getItem('calendar-year'), 10);
  const now = new Date();
  if (!year || !month) {
    month = now.getMonth();
    year = now.getFullYear();
  }
  return { month, year };
}

function setCalendarState(month, year) {
  sessionStorage.setItem('calendar-month', String(month));
  sessionStorage.setItem('calendar-year', String(year));
}

function renderCalendar() {
  const { month, year } = getCalendarState();
  const byDate = getWorkoutsByDate();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();

  document.getElementById('calendar-month-label').textContent = `${MONTH_NAMES[month]} ${year}`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  WEEKDAY_NAMES.forEach((day) => {
    const head = document.createElement('div');
    head.className = 'calendar-weekday';
    head.textContent = day;
    grid.appendChild(head);
  });

  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (i < startDay) {
      cell.classList.add('calendar-day--other');
    } else {
      const dayNum = i - startDay + 1;
      if (dayNum > daysInMonth) {
        cell.classList.add('calendar-day--other');
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cell.dataset.date = dateStr;
        cell.setAttribute('role', 'button');
        cell.tabIndex = 0;
        cell.textContent = dayNum;
        const bodyParts = byDate.get(dateStr);
        if (bodyParts && bodyParts.size > 0) {
          const dots = document.createElement('div');
          dots.className = 'calendar-dots';
          [...bodyParts].sort().forEach((part) => {
            const dot = document.createElement('span');
            dot.className = 'calendar-dot';
            dot.style.backgroundColor = BODY_PARTS[part].color;
            dot.title = BODY_PARTS[part].label;
            dots.appendChild(dot);
          });
          cell.appendChild(dots);
        }
      }
    }
    grid.appendChild(cell);
  }

  const previewEl = document.getElementById('calendar-day-preview');
  if (previewEl) {
    previewEl.hidden = true;
  }
}

function initCalendar() {
  renderCalendar();

  document.getElementById('calendar-grid').addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day');
    if (!cell || cell.classList.contains('calendar-day--other')) return;
    const dateStr = cell.dataset.date;
    if (dateStr) showCalendarDayPreview(dateStr);
  });

  document.getElementById('calendar-grid').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const cell = e.target.closest('.calendar-day');
    if (!cell || cell.classList.contains('calendar-day--other')) return;
    e.preventDefault();
    const dateStr = cell.dataset.date;
    if (dateStr) showCalendarDayPreview(dateStr);
  });

  document.getElementById('calendar-prev').addEventListener('click', () => {
    const { month, year } = getCalendarState();
    const nextMonth = month === 0 ? 11 : month - 1;
    const nextYear = month === 0 ? year - 1 : year;
    setCalendarState(nextMonth, nextYear);
    renderCalendar();
  });
  document.getElementById('calendar-next').addEventListener('click', () => {
    const { month, year } = getCalendarState();
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    setCalendarState(nextMonth, nextYear);
    renderCalendar();
  });
}

let currentEditingBlock = null;
const editExerciseContent = () => document.getElementById('edit-exercise-content');
const viewEditExercise = () => document.getElementById('view-edit-exercise');
const viewWorkouts = () => document.getElementById('view-workouts');

function openEditViewForBlock(block) {
  const expandedEl = block.querySelector('.exercise-block-expanded');
  const content = editExerciseContent();
  if (!expandedEl || !content) return;
  currentEditingBlock = block;
  expandedEl.classList.remove('exercise-block-panel--hidden');
  expandedEl.setAttribute('aria-hidden', 'false');
  content.appendChild(expandedEl);
  document.querySelectorAll('.app-view').forEach((v) => v.classList.remove('app-view--active'));
  const editView = viewEditExercise();
  if (editView) editView.classList.add('app-view--active');
}

function closeEditView() {
  const content = editExerciseContent();
  const editView = viewEditExercise();
  const workoutsView = viewWorkouts();
  if (!currentEditingBlock || !content || content.children.length === 0) {
    if (editView) editView.classList.remove('app-view--active');
    if (workoutsView) workoutsView.classList.add('app-view--active');
    currentEditingBlock = null;
    return;
  }
  const expandedEl = content.firstElementChild;
  if (expandedEl) currentEditingBlock.appendChild(expandedEl);
  if (typeof currentEditingBlock._showCondensed === 'function') currentEditingBlock._showCondensed();
  currentEditingBlock = null;
  if (editView) editView.classList.remove('app-view--active');
  if (workoutsView) workoutsView.classList.add('app-view--active');
}

function initViewSwitch() {
  const views = document.querySelectorAll('.app-view');
  const tiles = document.querySelectorAll('.nav-tile');

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const viewId = tile.dataset.view;
      if (!viewId) return;

      if (viewEditExercise() && viewEditExercise().classList.contains('app-view--active')) {
        closeEditView();
      }

      views.forEach((v) => v.classList.remove('app-view--active'));
      tiles.forEach((t) => t.classList.remove('nav-tile--active'));

      const target = document.getElementById(`view-${viewId}`);
      if (target) target.classList.add('app-view--active');
      tile.classList.add('nav-tile--active');
    });
  });
}

document.getElementById('edit-exercise-back-btn').addEventListener('click', closeEditView);

document.addEventListener('DOMContentLoaded', () => {
  initForm();
  initCalendar();
  initViewSwitch();
  renderWorkouts();
});
