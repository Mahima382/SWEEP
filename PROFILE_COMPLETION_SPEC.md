# SWEEP — Post-Login Profile Completion Spec

> **Status:** Not implemented. This is a field checklist for the profile
> completion flow that runs after login, once basic registration (FR-01) is
> in place. Nothing below is built yet — implement it as a separate task.

## Why this split exists

Registration (`frontend/src/pages/Register.jsx`) now only collects the
minimum needed to create a login credential:

- Full Name
- Email Address
- Mobile Number
- Password / Confirm Password
- Account Type (`household` | `collector` | `global` | `company`, chosen
  before the form via `AccountTypeSelect`)

Everything else — NID, KYC documents, address, payout method, vehicle info,
company licences, etc. — is deferred to a **"Complete your profile"** flow
shown after the user logs in for the first time. This file lists what that
flow needs to collect, per account type, so it can be implemented later
without re-deriving the requirements from FR-01/FR-05/FR-07 in `CLAUDE.md`.

Until profile completion is implemented, accounts are created with only the
fields above; role-specific features that depend on the fields below (e.g.
pickup scheduling needs an address, withdrawals need a payout method) should
be treated as blocked on this work.

---

## Household (FR-01, FR-03, FR-04)

No KYC required (locked decision).

| Field | Required | Notes |
|-------|----------|-------|
| NID Number | Yes | Per registration rules in `CLAUDE.md` §5 |
| Division | Yes | Address, select |
| District | Yes | Address, select |
| City / Municipality | Yes | |
| Ward / Zone | No | |
| Area | Yes | |
| Postal Code | No | |
| Detailed Address | Yes | Textarea — house/flat, road, block |
| Map pin (lat/lng) | Yes | Exact pickup location, Google Maps |
| Payout method | No at profile-completion time, required before first withdrawal (FR-04) | bKash / Nagad / Bank |
| Payout account number | Conditional | Required once a payout method is chosen |
| Bank name + branch | Conditional | Only when payout method is Bank |

## Local Collector (FR-01, FR-05)

KYC required — account stays pending until an admin approves it.

| Field | Required | Notes |
|-------|----------|-------|
| NID Number | Yes | KYC |
| NID Issue Date | No | |
| NID Front / Back images | Yes | Upload, KYC |
| Profile Photo | Yes | Upload |
| Date of Birth | Yes | |
| Gender | No | |
| Service address | Yes | Same shape as household address above |
| Map pin (lat/lng) | Yes | Base of operations |
| Daily Pickup Capacity | Yes | e.g. "12 pickups/day" |
| Vehicle Type | No | Select |
| Vehicle Registration Number | No | |
| Service Zones / Wards | Yes | Multi-select — defines the collector's coverage area (FR-05 zone setup) |
| Payout method | No at profile-completion time, required before first withdrawal (FR-06) | bKash / Nagad / Bank |

## Global Collector (FR-01, FR-05)

KYC required — account stays pending until an admin approves it.

| Field | Required | Notes |
|-------|----------|-------|
| NID Number | Yes | KYC |
| NID Front / Back images | Yes | Upload, KYC |
| Profile Photo | Yes | Upload |
| Driving Licence Number | Yes | |
| Driving Licence document | Yes | Upload |
| Vehicle Registration Number | Yes | |
| Vehicle Registration document | Yes | Upload |
| Vehicle Capacity | Yes | Load capacity (e.g. tons) — matches lots the collector can transport |
| Payout method | No at profile-completion time, required before first withdrawal | bKash / Nagad / Bank |

## Recycling Company (FR-01, FR-07, FR-08)

KYC required, and the account is gated behind a subscription before it can
use the marketplace (locked decision, FR-07: Basic/Pro/Enterprise, 3-day
grace period).

| Field | Required | Notes |
|-------|----------|-------|
| Company Name | Yes | |
| Registration Number | Yes | |
| Business Type | No | Select |
| Year Established | No | |
| Office Address | Yes | Textarea |
| Service Regions | No | Select — feeds the region-filtered newsfeed (FR-08.1) |
| Supported Waste Categories | Yes | Multi-select from the 8 categories in `CLAUDE.md` §5 |
| E-Waste Handling Licence Number | Conditional | Required only if "E-waste" is selected — E-waste is licence-gated |
| E-Waste Licence document | Conditional | Upload, required with the above |
| Trade Licence | Yes | Upload, KYC |
| Company Registration certificate | Yes | Upload, KYC |
| TIN / Tax Certificate | Yes | Upload, KYC |
| VAT Certificate | Yes | Upload, KYC |
| Director NID | Yes | Upload, KYC |
| Other supporting documents | No | Upload |
| Authorized Person — Name | Yes | |
| Authorized Person — Role / Designation | Yes | |
| Authorized Person — Phone | Yes | |
| Authorized Person — Email | Yes | |
| Authorized Person — NID Number | Yes | |
| Subscription Plan | Yes | Basic / Pro / Enterprise — selected post-KYC approval, gates marketplace access (FR-07) |

---

## Out of scope (unaffected by this doc)

- No bidding/auction fields (removed, locked decision).
- No escrow fields (removed, locked decision).
- Admin accounts are platform-managed and are never self-registered.
