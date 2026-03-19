# Home Care Nurse

## Current State
- NursesPage has a single pincode filter that queries the backend by 6-digit pincode
- Nurse type has no location coordinates (latitude/longitude)
- NurseRegisterPage has no location capture option

## Requested Changes (Diff)

### Add
- `latitude: ?Float` and `longitude: ?Float` optional fields to the `Nurse` backend type
- Optional "Detect My Location" section on NurseRegisterPage so nurses can share their GPS coordinates when registering
- Second filter mode on NursesPage: "Nearby (10-15 km)" -- uses browser geolocation to get the patient's current position, then filters all nurses whose stored coordinates are within 10-15 km using the Haversine formula (pure frontend calculation)
- Distance badge on NurseCard when displaying nearby results (e.g. "3.2 km away")

### Modify
- NursesPage: Replace single filter bar with two tab/toggle options: "Filter by Pincode" and "Filter by Nearby Location"
- NurseRegisterPage: Add optional location section with a "Detect My Location" button that auto-fills lat/lng via `navigator.geolocation`; nurses can also skip this
- `useRegisterNurse` mutation must pass `latitude` and `longitude` optional fields

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend to add optional `latitude` and `longitude` Float fields to the `Nurse` type
2. Update NursesPage to show two filter tabs: Pincode and Nearby; implement Haversine distance filter on frontend using all nurses data
3. Update NurseRegisterPage to add optional GPS location capture section
4. Pass distance to NurseCard for display when filtering by location
