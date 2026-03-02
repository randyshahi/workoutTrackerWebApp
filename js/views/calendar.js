/**
 * Calendar view: month grid, workout dots by body part, day preview.
 */

import { getWorkoutsByDate, getWorkoutByDate, BODY_PARTS } from '../data.js';
import { escapeHtml } from '../helpers.js';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../constants.js';

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

export function showCalendarDayPreview(dateStr) {
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

export function renderCalendar() {
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

export function initCalendar() {
  renderCalendar();

  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day');
    if (!cell || cell.classList.contains('calendar-day--other')) return;
    const dateStr = cell.dataset.date;
    if (dateStr) showCalendarDayPreview(dateStr);
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const cell = e.target.closest('.calendar-day');
    if (!cell || cell.classList.contains('calendar-day--other')) return;
    e.preventDefault();
    const dateStr = cell.dataset.date;
    if (dateStr) showCalendarDayPreview(dateStr);
  });

  const prevBtn = document.getElementById('calendar-prev');
  const nextBtn = document.getElementById('calendar-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const { month, year } = getCalendarState();
      const nextMonth = month === 0 ? 11 : month - 1;
      const nextYear = month === 0 ? year - 1 : year;
      setCalendarState(nextMonth, nextYear);
      renderCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const { month, year } = getCalendarState();
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      setCalendarState(nextMonth, nextYear);
      renderCalendar();
    });
  }
}
