/**
 * Date picker UI: trigger, list of recent dates, sync with hidden input.
 */

import { formatDatePickerLabel } from '../helpers.js';

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

export function updateDatePickerTriggerLabel() {
  const trigger = document.getElementById('date-picker-trigger');
  const dateInput = document.getElementById('date');
  if (!trigger || !dateInput || !dateInput.value) return;
  trigger.textContent = formatDatePickerLabel(dateInput.value);
}

export function renderDatePicker(selectedValue) {
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

export function initDatePicker() {
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
