# Workout Tracker

A simple web app to log daily workouts. Data is stored in your browser (localStorage), so nothing is sent to a server.

## What you can do

- **Log a workout**: Pick a date, enter workout type (e.g. Running, Weights), optional duration in minutes, and optional notes.
- **View workouts**: All logged workouts appear in a list, newest first.
- **Delete**: Remove a workout with the Delete button on each row.

## How to run

1. Open the project folder in your editor.
2. Serve the folder with any static server, or open `index.html` directly in a browser.

**Option A – Open file directly**

- Double-click `index.html` or drag it into a browser window.  
  (Some browsers may restrict scripts when using `file://`; if things don’t work, use Option B.)

**Option B – Local server (recommended)**

With Node.js installed:

```bash
npx serve .
```

Then go to the URL shown (e.g. `http://localhost:3000`).

With Python 3:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Files

- `index.html` – Main page (form + workout list)
- `styles.css` – Layout and styling
- `script.js` – Logging, storage, and list rendering
- `README.md` – This file
