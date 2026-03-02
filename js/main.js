/**
 * App entry: wire views and init on DOMContentLoaded.
 */

import { initForm } from './views/workoutForm.js';
import { renderWorkouts } from './views/workoutsList.js';
import { initCalendar } from './views/calendar.js';
import { openEditViewForBlock, closeEditView, initEditExercise } from './views/editExercise.js';
import { initViewSwitch } from './views/viewSwitch.js';

document.addEventListener('DOMContentLoaded', () => {
  initEditExercise();
  initForm({ openEditViewForBlock, closeEditView });
  initCalendar();
  initViewSwitch();
  renderWorkouts();
});
