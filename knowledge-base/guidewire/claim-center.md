# ClaimCenter — Workflows, Rules & Test Standards

## FNOL (First Notice of Loss) Workflow

### FNOL Required Fields
- Claimant: name, contact phone, relationship to insured
- Loss date and time (cannot be in the future)
- Loss location: address or GPS coordinates
- Loss type: must match policy coverages (auto, property, liability, etc.)
- Reporter: can differ from claimant; record reporter separately
- Policy lookup: by policy number OR insured name + DOB + zip

### FNOL State Flow
`New → Open → Closed` (or `New → Duplicate → Merged`)

### Duplicate Detection Rules
- System flags if same policy number + loss date within ±3 days already has an open claim
- Adjuster must explicitly confirm duplication or merge
- Merged claim retains the lower claim number

### GOSU / PCF Reference
- `ClaimCenter/modules/cc/domain/claim/fnol/FNOLWizard.pcf`
- `ClaimAvailability.gsx` — coverage matching
- `DuplicateClaimPlugin.gsx` — duplication logic
- `ClaimContactRoles.gsx` — claimant / reporter role assignments

---

## Claim Assignment

### Assignment Rules
- Auto-assignment by `ClaimAssignmentPlugin.gsx` based on: loss type, adjuster workload, geography, license (PIP, UM/UIM require licensed adjuster)
- Manual override allowed with supervisor permission level
- Specialty queues: Catastrophe (CAT), SIU (Special Investigations Unit), Subrogation

### Adjuster Workload Caps
- Standard property claims: max 75 open per adjuster
- Complex liability: max 30 open per adjuster
- CAT events: cap suspended, all adjusters redirected

### Testing Notes
- Test auto-assignment with each loss type permutation
- Test manual override with and without supervisor role
- Test reassignment notification (email + activity)

---

## Reserve Management

### Reserve Types
| Reserve Type | Description |
|-------------|-------------|
| `INDEMNITY` | Payment to claimant |
| `EXPENSE` | LAE — legal, expert fees |
| `RECOVERY` | Expected subrogation/salvage recovery |

### Reserve Business Rules
- Initial reserve must be set within 24 hours of claim open (configurable)
- Reserve decrease > 25% requires manager approval
- Reserve cannot be reduced below total payments already made
- Closing reserves to $0 is only allowed when claim moves to `Closed`
- Authority limits: adjuster ($10k), supervisor ($50k), manager (unlimited)

---

## Payment Processing

### Payment Types
- `Indemnity` — direct payment to claimant or repair vendor
- `Expense` — payment to attorney, expert, appraiser
- `Recovery` — receipt of salvage or subrogation proceeds

### Payment Rules
- Cannot exceed remaining reserve (system hard stop)
- Duplicate payment detection: same payee + same amount within 30 days = warning
- EFT payments over $10,000 require additional verification step
- Void allowed within 24 hours if not yet transmitted to payment gateway
- Stop payment available after 24 hours; creates recovery item

### Payment States
`Draft → Submitted → Approved → Transmitted → Cleared`

### Common Payment Defect Patterns
- Missing payee tax ID blocks EFT (W-9 not collected)
- Reserve not increased before large payment → hard stop error
- Multi-party payment (claimant + lienholder) requires both payees on single check

---

## Subrogation Workflow

### Subrogation Trigger Conditions
- At-fault third party identified at FNOL
- Payment type = Indemnity where third party liability exists
- Auto-flagged by `SubrogationEligibilityPlugin.gsx`

### Subrogation States
`Potential → In Progress → Collected → Closed`

### Key Rules
- Demand letter must be sent within statute of limitations (state-specific, 2–6 years)
- Recovery tracked separately from claim payments in `RECOVERY` reserve
- Partial recovery: pro-rated allocation between insurer and insured per policy language

---

## ClaimCenter Testing Checklist

- FNOL with future loss date must be rejected
- Coverage match: loss type not covered → informational warning, not block
- Duplicate claim detection within ±3 days window
- Reserve decrease >25% requires manager approval flow
- Payment exceeding reserve: verify hard stop message
- Void payment within 24h and after 24h (different behaviors)
- CAT flag: verify workload cap suspension
- Subrogation auto-trigger on at-fault third party entry
