/**
 * Edit exercise view: moves an exercise block's expanded panel into a full-screen view and back.
 */

let currentEditingBlock = null;

function editExerciseContent() {
  return document.getElementById('edit-exercise-content');
}

function viewEditExercise() {
  return document.getElementById('view-edit-exercise');
}

function viewWorkouts() {
  return document.getElementById('view-workouts');
}

export function openEditViewForBlock(block) {
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

export function closeEditView() {
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

export function initEditExercise() {
  const btn = document.getElementById('edit-exercise-back-btn');
  if (btn) btn.addEventListener('click', closeEditView);
}
