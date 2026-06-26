# PolicyCenter — Workflows, Rules & Test Standards

## New Business Submission Workflow

### Submission States
A submission moves through these states: `Draft → Quoted → Bound → Issued`.
- **Draft**: Initial data entry; no premium calculated yet
- **Quoted**: Underwriting rules evaluated; premium displayed
- **Bound**: Coverage confirmed; policy number assigned
- **Issued**: Policy documents generated and delivered

### Required Fields for Personal Auto Submission
- Named insured: first name, last name, date of birth, driver licence number, state
- Principal garage address (cannot be PO Box)
- At least one vehicle: VIN, year, make, model, primary use
- At least one driver assigned to at least one vehicle
- Effective date must be ≥ today and ≤ today + 60 days
- Payment plan selection before binding

### Underwriting Rules (Auto)
- `UW001`: Drivers under 18 require parental co-insured — hard stop
- `UW002`: Vehicles > 25 years old trigger classic car flag — advisory
- `UW003`: More than 3 at-fault accidents in 3 years → referral to underwriter
- `UW004`: SR-22 filing required if conviction code = DUI within 5 years
- `UW005`: Liability limits must be ≥ state minimums; system validates per garaging state

### GOSU Validation Entry Points
- `PolicyCenter/modules/pc/domain/policy/submission/NewSubmissionWizard.pcf` — main wizard PCF
- `SubmissionProcess.gsx` — workflow entry point
- `PersonalAutoLine.gsx` — line-level business rules
- `VehicleValidation.gsx` — vehicle eligibility checks

---

## Policy Change (Endorsement) Workflow

### Change Types & Effective Date Rules
- Vehicle add/remove: effective date ≥ original policy effective date
- Driver add/remove: retroactive not allowed; must be future or today
- Coverage change: mid-term allowed; premium pro-rated automatically
- Address change: garaging state change may retrigger UW rules

### Endorsement States
`Draft → Quoted → Bound`

### Key Business Rules
- Cannot bind a change while another change is already in `Quoted` state on the same policy
- Cancellation or reinstatement in progress blocks endorsements
- Premium adjustment threshold: changes < $5 are suppressed (configurable via parameter `MinPremiumAdjustment`)

---

## Renewal Workflow

### Renewal Pre-Processing (T-90 Days)
1. Renewal offer generated automatically by batch job `RenewalOfferBatch`
2. Underwriting re-evaluation runs; flags changes in risk
3. Premium recalculated with current rates
4. Renewal offer letter generated

### Renewal States
`Renewing → Quoted → Renewed`

### Non-Renewal Rules
- Non-renewal notice must be sent ≥ 45 days before expiration (jurisdiction-dependent)
- Reason code required on all non-renewals
- System blocks non-renewal if claim is open within 60 days of expiration

---

## Cancellation Workflow

### Cancellation Reason Codes
| Code | Description | Notice Period |
|------|-------------|---------------|
| `NONPAYMENT` | Insured failed to pay | 10 days |
| `UNDERWRITING` | Risk no longer acceptable | 30 days |
| `INSURED_REQUEST` | Named insured requested | Day of receipt |
| `FRAUD` | Material misrepresentation | Immediate |

### Flat vs. Pro-Rata Cancellation
- Insured-initiated: pro-rata refund (configurable per state)
- Company-initiated for non-payment: short-rate penalty may apply (state-dependent)
- Earned premium calculation in `CancellationPlugin.gsx`

---

## Reinstatement Workflow

### Reinstatement Conditions
- Only policies in `Cancelled` state can be reinstated
- Lapse period > 30 days requires new application
- Outstanding balance must be cleared before reinstatement
- UW re-evaluation triggered automatically for lapses > 7 days

---

## Testing Checklist for PolicyCenter

- Validate all required fields show inline errors when blank
- Test premium recalculation after vehicle or driver change
- Verify state-specific minimum limits are enforced
- Test boundary: effective date = today, effective date = today + 60, effective date = today + 61 (should fail)
- Test UW rules: create scenarios for each UW00x rule
- Verify policy number format: prefix + 9 digits, alpha-numeric
- Test concurrent endorsement blocking
- Verify audit trail entries after each state change
