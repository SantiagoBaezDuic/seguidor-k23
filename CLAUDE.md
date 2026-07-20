# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page React app (in Spanish) that tracks progress through UTN FRBA's "Ingeniería en Sistemas de Información" (K23 curriculum) degree plan: subject states, correlativas (prerequisites), an intermediate-title tracker, a course planner, a weekly schedule builder, and a classmate progress comparison feature. No backend — all persistence is `localStorage`.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

There is no test runner configured (no Jest/Vitest in `package.json`) and no lint script, despite `src/App.test.jsx` existing — that file is a plain diagnostic component, not an actual test.

## Architecture

### Data model (`src/data/subjects.js`)

The entire curriculum is one static array of subject objects. Fields use short codes:
- `id`: unique numeric ID (not necessarily contiguous — IDs 26 and 38 have gaps in some ranges)
- `l`: level, 1–5 for required subjects, 6 for electives
- `rc`: correlativas de cursada — prerequisites required to be *regular or approved* (state ≥ 1) before enrolling
- `ra`: correlativas de aprobación — prerequisites required to be *approved* (state ≥ 2) before enrolling
- `it`: whether the subject counts toward the intermediate title "Analista de Sistemas"
- `isElective`, `hideCorrelations`, `code`: elective-only metadata (electives all share the same `rc` shape and hide correlation arrows in the UI since they'd all point to the same two subjects)

`rc`/`ra` support two shapes:
- legacy array `[id, id, ...]` = AND of all listed IDs
- object `{ all: [...], any: [...] }` = AND of `all` plus OR of `any`

Every function that consumes correlativas (`canEnroll`, `canTakeExam`, `correlatesToText`, `getAffectedSubjects`) must handle both shapes — see `evaluateCorrelatives` / `includesInCorrelatives` in `src/utils/correlations.js` for the canonical pattern.

Subject state is a tri-state integer, not stored on the subject itself: `0` = no cursada, `1` = regular/cursada, `2` = aprobada. States live in a separate `{ [subjectId]: state }` map (`useSubjectsState`), and toggling cycles `0 → 1 → 2 → 0`.

### State/hooks layering

`src/App.jsx` composes four hooks, each independently backed by `useLocalStorage` (`src/hooks/useLocalStorage.js`) where persistence is needed:

- `useSubjectsState` (`src/hooks/useSubjectsState.js`) — owns the `states` map (localStorage key `isi-tracker-states`), derives `canEnroll`/`canTakeExam` per subject, overall progress, and intermediate-title progress via `src/utils/correlations.js`. Produces `subjectsWithStatus`, the enriched subject list most components render from.
- `useScheduleState` (`src/hooks/useScheduleState.js`) — owns the weekly schedule (`isi-tracker-schedule`), keyed by subject ID → array of `{ day, startSlot, endSlot }` blocks; day is 0–6, slot is 0–18. Provides conflict detection (`hasConflictInCell`, `getConflicts`) but does not block adding overlapping slots — it warns and lets the UI surface it.
- `useComparisonState` (`src/hooks/useComparisonState.js`) — in-memory only (not persisted), holds up to 10 imported classmate states (from JSON exports) and derives common-enrollable subjects / group compatibility via `src/utils/compareProgress.js`.
- `useLocalStorage('isi-show-electives', ...)` — simple UI toggle, used directly in `App.jsx`.

`App.jsx` also owns transient, non-persisted UI state (active filters, selected courses for the planner, highlight timeouts for correlation visualization) and wires the hooks together — e.g. `syncWithSelectedSubjects`/`syncSelectedCoursesFromSchedule` keep the planner's selected-course list and the schedule's keys from diverging after import/edit.

### Correlativas engine (`src/utils/correlations.js`)

This is the module that everything else depends on:
- `canEnroll(subjectId, states)` — true only if all `rc` prerequisites are ≥ regular AND all `ra` prerequisites are ≥ approved.
- `getAffectedSubjects(subjectId, subjects)` — reverse lookup, used to highlight downstream subjects when a state changes (drives `CorrelationLines` and the 2-second highlight-then-clear behavior in `App.jsx`).
- `calculateProgress`/`calculateIntermediateProgress` — progress accounts for electives specially: only 7 of the 19 electives count toward the required total, so elective counts are capped when computing `porcentaje`.

`src/utils/compareProgress.js` builds on `canEnroll` to answer "which pending subjects can the user and all/one imported classmates currently enroll in" — this is what powers `ClassmateComparison`.

### Components (`src/components/`)

Presentational, one concern each: `LevelColumn`/`SubjectCard` render the curriculum grid per level; `CorrelationLines` draws SVG arrows between correlated subjects positioned via `containerRef` DOM measurement (not a layout library); `CoursePlanner` + `WeeklySchedule` implement the semester planner and its schedule grid; `ExportImport` handles JSON export/import of `states/schedule` for backup and for classmate comparison; `Statistics`/`Filters`/`TooltipLegend` are control-panel widgets.

## Conventions

- Comments, subject names, and UI copy are in Spanish; keep new code consistent with this.
- Styling is Tailwind utility classes with a dark theme (`bg-gray-950`/`text-gray-100` base); no CSS modules or styled-components.
- No TypeScript — plain JSX with JSDoc-style comments on exported functions in `utils/`/`hooks/`.
