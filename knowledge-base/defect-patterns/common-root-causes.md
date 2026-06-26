# Common Defect Patterns & Root Causes in Guidewire

## PolicyCenter Defects

### PC-DEF-001: Premium Calculation Discrepancy
**Symptoms:** Premium shown on quote screen differs from final policy premium; endorsement premium delta incorrect.
**Root Causes:**
- Rate table not refreshed after deployment (`RatingPlugin.gsx` using stale cache)
- Rounding rule difference between quote and bind — check `PremiumRoundingPlugin`
- Pro-rata calculation for mid-term endorsement using wrong factor (check `ProRataPlugin.gsx`)
- State-specific surcharge or discount factor missing from `RatingFactors` table

**Fix Approach:**
1. Compare premium calculation logs at quote vs. bind
2. Check last deployment date of rate tables against defect report date
3. Validate `RatingFactors` database table for the garaging state
4. Review `PremiumAdjustmentRules.gsx` for the specific line of business

**Regression Areas:** All quote/bind flows, endorsement premium, renewal premium, cancellation refund calculations

---

### PC-DEF-002: Validation Fires at Wrong Trigger Point
**Symptoms:** Validation error appears too early (on page load) or too late (after submit); user cannot proceed despite valid data.
**Root Causes:**
- PCF `visible` vs `editable` condition logic inverted
- `validationExpression` on wrong PCF element (field vs. panel vs. wizard step)
- Missing `null` check in GOSU validation — NullPointerException swallowed as generic error
- Conflicting validation in both PCF and GOSU rule — one fires before the other clears

**Fix Approach:**
1. Open PCF in Studio; inspect `validationExpression` attribute
2. Add logging to the GOSU rule to confirm which code path executes
3. Check for null guards on entity properties before comparison
4. Verify PCF data binding (`value` attribute) points to correct entity field

---

### PC-DEF-003: Workflow State Stuck / Cannot Advance
**Symptoms:** Submission stuck in `Draft`; bound policy won't issue; endorsement stays in `Quoted`.
**Root Causes:**
- Required activity not completed (e.g., UW approval activity open)
- Policy validation check fails silently (no UI error shown)
- Workflow condition in `SubmissionProcess.gsx` references deleted or renamed entity field
- Concurrent modification: two sessions edited same entity; optimistic lock exception

**Fix Approach:**
1. Check `PolicyCenter > Administration > Workflow Instances` for the stuck entity
2. Look for open required activities on the policy
3. Review server log for `OptimisticLockException` or workflow transition errors
4. Check `PolicyPeriod.WorkflowState` directly in database

---

## ClaimCenter Defects

### CC-DEF-001: Payment Blocked Unexpectedly
**Symptoms:** Payment submission errors with "Exceeds authority" or "Exceeds reserve" even when values appear correct.
**Root Causes:**
- Authority limit evaluated against total claim payments, not single transaction
- Reserve recalculated by overnight batch between user's view and submission
- Currency rounding: UI shows $10,000.00 but reserve is $9,999.99 after cents
- Multiple browser tabs: reserve decreased in another tab not reflected in current

**Fix Approach:**
1. Refresh reserve view immediately before payment; compare DB value to screen value
2. Check adjuster authority record in `User > Authority Profiles`
3. Review `PaymentAuthorityPlugin.gsx` for the authority calculation logic
4. Check claim audit trail for reserve changes by batch processes

**Regression Areas:** All payment types (Indemnity, Expense), reserve management, authority validation

---

### CC-DEF-002: Coverage Match Fails on Valid Loss Type
**Symptoms:** "No coverage found" error at FNOL even though policy has the relevant coverage.
**Root Causes:**
- Loss type code mapping not defined in `CoveragePattern` → `LossType` mapping table
- Policy effective date check: loss date is before policy effective date by timezone offset
- Coverage exclusion rule in `CoverageAvailability.gsx` incorrectly applied
- Policy synced to ClaimCenter with stale coverage data (sync lag)

**Fix Approach:**
1. Check `LossTypeCoverage` mapping in Administration > Loss Types
2. Compare loss date timezone with policy effective date timezone (use UTC internally)
3. Confirm last PolicyCenter → ClaimCenter sync timestamp
4. Check `ClaimAvailability.gsx` exclusion conditions for the specific coverage code

---

### CC-DEF-003: Duplicate FNOL Not Detected
**Symptoms:** Multiple claims created for same loss event on same policy.
**Root Causes:**
- Loss date entered with time component differs by minutes (same day, different time)
- Different reporter names but same underlying claimant — name-based matching fails
- `DuplicateClaimPlugin.gsx` disabled or threshold changed in configuration
- FNOL submitted via API integration bypasses duplicate check

**Fix Approach:**
1. Check `DuplicateClaimPlugin` configuration: `DuplicateWindowDays` parameter
2. Review FNOL intake path — UI vs. API vs. batch — to confirm which bypassed the check
3. Tighten matching to ignore time component; compare loss date as date-only

---

## BillingCenter Defects

### BC-DEF-001: Delinquency Not Triggered on Schedule
**Symptoms:** Overdue invoice does not progress to delinquent state; cancellation notice not sent.
**Root Causes:**
- `DelinquencyProcessBatch` not scheduled or job failed silently
- Account-level `DelinquencyPlan` not assigned (uses null plan, no thresholds)
- Billing instruction `HoldDelinquency` flag set on account from prior manual action
- Payment posted in suspense — system considers account current despite open invoice

**Fix Approach:**
1. Check batch job logs for `DelinquencyProcessBatch` run history
2. Verify account's `DelinquencyPlan` assignment in BillingCenter > Account > Settings
3. Check `HoldDelinquency` flag on billing instruction
4. Review suspense account for unapplied payments belonging to this account

---

### BC-DEF-002: Incorrect Payment Application (Wrong Invoice Paid)
**Symptoms:** Payment applied to future invoice instead of oldest past-due invoice.
**Root Causes:**
- Payment plan uses `LIFO` algorithm instead of `FIFO` (misconfiguration)
- Invoice `DueDate` stored incorrectly (timezone or calendar error)
- Manual payment instruction overrides automatic application algorithm
- Agency bill remittance mapped to wrong policy within the agency account

**Fix Approach:**
1. Check account's `PaymentApplicationOrdering` parameter
2. Sort all open invoices by `DueDate` ascending; verify oldest has `Past Due` status
3. Check `PaymentApplicationPlugin.gsx` for custom override logic
4. Review invoice due dates for any timezone discrepancy

---

## General / Cross-Center Defects

### GW-DEF-001: UI Freezes on Large Data Sets
**Symptoms:** PCF screen hangs when loading list with many rows (>500 records).
**Root Causes:**
- LV (ListView) query lacks pagination or `maxRows` limit
- GOSU iterator over result set executing N+1 database queries
- `LoadedListViewConfig` not limiting columns; all entity fields loaded

**Fix Approach:**
1. Add `maxRows` or pagination parameter to the ListView query
2. Review GOSU iterator; convert to batch query with `find()` instead of lazy loading
3. Profile slow screens with Guidewire DataHub query logs

---

### GW-DEF-002: Stale Data After Save (UI Shows Old Value)
**Symptoms:** User saves a field, success message shown, but old value redisplays on page.
**Root Causes:**
- PCF `outputColumn` bound to a transient property not persisted to database
- Entity not committed to transaction before redirect
- Browser cache serving stale page (usually in older non-SPA PCF screens)

**Fix Approach:**
1. Check PCF `value` attribute — ensure it maps to a persisted entity field, not transient
2. Add `commit()` call before `return` in GOSU rule if missing
3. Hard refresh browser; check with network tab whether GET returns new or old value
