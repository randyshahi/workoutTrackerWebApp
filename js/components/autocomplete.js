/**
 * Exercise name autocomplete dropdown for exercise blocks.
 */

import { getAllExerciseNames } from '../data.js';

export function createExerciseAutocomplete() {
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
