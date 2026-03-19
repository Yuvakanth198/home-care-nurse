# Home Care Nurse

## Current State
Nurse profiles have an `isAvailable: Bool` field. The NurseCard already shows an Available/Busy badge based on this field. However, nurses have no way to toggle their own availability -- only admin can update nurse records.

## Requested Changes (Diff)

### Add
- Backend: `setNurseAvailability(registrationNumber, phone, isAvailable)` -- public function (no admin login), verifies nurse by credentials and updates only the `isAvailable` field.
- Frontend: `useSetNurseAvailability` hook in `useQueries.ts`.
- Frontend: Availability toggle card in `NurseDashboardPage.tsx` -- shown after nurse logs in, displays current ON/OFF status with a large toggle switch and saves to backend.

### Modify
- `NurseDashboardPage.tsx`: After login, show an "Availability" section above the upload form with current status and a toggle switch nurses can flip.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `setNurseAvailability` to `src/backend/main.mo`.
2. Add `useSetNurseAvailability` to `src/frontend/src/hooks/useQueries.ts`.
3. Add availability toggle UI to `NurseDashboardPage.tsx`.
4. Add translation keys for availability toggle in `translations.ts`.
