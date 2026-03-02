/**
 * Bottom nav: switch between workouts and calendar views; close edit view when switching.
 */

import { closeEditView } from './editExercise.js';

export function initViewSwitch() {
  const views = document.querySelectorAll('.app-view');
  const tiles = document.querySelectorAll('.nav-tile');

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const viewId = tile.dataset.view;
      if (!viewId) return;

      const viewEditExercise = document.getElementById('view-edit-exercise');
      if (viewEditExercise && viewEditExercise.classList.contains('app-view--active')) {
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
