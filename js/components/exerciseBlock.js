/**
 * Single exercise block in the workout form: name autocomplete, weight/reps/RPE, sets list.
 * Receives onEdit callback to open the edit view when condensed block is tapped.
 */

import { escapeHtml, formatSetSummary } from '../helpers.js';
import { createExerciseAutocomplete } from './autocomplete.js';

/**
 * @param {{ onEdit: (block: HTMLElement | null) => void }} callbacks - onEdit(block) when opening edit view, onEdit(null) when closing
 */
export function createExerciseBlock(callbacks = {}) {
  const { onEdit, onCloseEdit } = callbacks;
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

  condensedEl.addEventListener('click', () => {
    if (typeof onEdit === 'function') onEdit(block);
  });
  block.querySelector('.back-to-condensed-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onCloseEdit === 'function') onCloseEdit();
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
