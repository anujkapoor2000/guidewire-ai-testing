# Test Case Standards & Templates

## Naming Conventions

### Test Case ID Format
`[CENTER]-[MODULE]-[TYPE]-[SEQ]`
- CENTER: `PC` (PolicyCenter), `CC` (ClaimCenter), `BC` (BillingCenter), `CM` (ContactManager)
- MODULE: `SUB` (Submission), `END` (Endorsement), `REN` (Renewal), `CAN` (Cancellation),
  `FNOL`, `PAY` (Payment), `RSV` (Reserve), `SUB` (Subrogation), `DEL` (Delinquency)
- TYPE: `POS` (Positive/Happy Path), `NEG` (Negative), `BVA` (Boundary Value), `INT` (Integration)
- SEQ: 3-digit zero-padded sequence number

**Examples:**
- `PC-SUB-POS-001` — PolicyCenter Submission, positive test #1
- `CC-FNOL-NEG-003` — ClaimCenter FNOL, negative test #3
- `BC-DEL-BVA-001` — BillingCenter Delinquency, boundary value test #1

---

## Gherkin / BDD Template

```gherkin
Feature: [Feature Name] — [Center] [Module]

  Background:
    Given I am logged in as a [role: CSR / Adjuster / Billing Specialist / Underwriter]
    And I am on the [page/screen name]

  @[tag] @[priority: high|medium|low]
  Scenario: [TC-ID] [Brief description of test scenario]
    Given [precondition or initial state]
    And [additional precondition if needed]
    When [action taken by user or system]
    And [additional action if needed]
    Then [expected outcome / assertion]
    And [additional assertion if needed]
```

### Tags to Use
- `@smoke` — must-pass for any deployment
- `@regression` — full regression suite
- `@happy-path` — positive scenarios
- `@negative` — error and rejection scenarios
- `@boundary` — edge/boundary values
- `@integration` — cross-center or external system tests
- `@high`, `@medium`, `@low` — priority

---

## Step-by-Step Template

```
Test Case ID: [TC-ID]
Title:        [What is being tested]
Priority:     High / Medium / Low
Module:       [Guidewire Center + Workflow]
Preconditions:
  - [State or data that must exist before test]
  - [User role and permissions required]

Steps:
  1. [Action]
     Expected: [Result]
  2. [Action]
     Expected: [Result]
  ...

Pass Criteria:  [What must be true for test to pass]
Fail Criteria:  [What constitutes a test failure]
Test Data:      [Specific data values required]
Notes:          [Any caveats, environment dependencies, known flakiness]
```

---

## Test Matrix Template

A test matrix maps inputs to expected outcomes in tabular form. Use for:
- Coverage combinations
- State-based transitions
- Permission / role matrices

```
| Scenario | Input A | Input B | Expected Result | Priority |
|----------|---------|---------|-----------------|----------|
| ...      | ...     | ...     | ...             | High     |
```

---

## Coverage Categories (Must Have in Every Test Suite)

### 1. Happy Path (Positive)
- All required fields valid
- Normal business flow end-to-end
- Verify confirmation message and state change
- Verify data persisted correctly in database

### 2. Negative / Error Scenarios
- Blank required fields (one at a time)
- Invalid format (wrong date format, bad email, invalid VIN)
- Out-of-range values (future loss date, policy not found)
- Business rule violations (duplicate, unauthorised action)

### 3. Boundary Value Analysis
- Minimum allowed value
- Maximum allowed value
- One below minimum (should fail)
- One above maximum (should fail)
- Typical mid-range value

### 4. Workflow State Tests
- Cannot skip a required state
- Correct next states are available from each state
- Irreversible states cannot be undone

### 5. Permission / Role Tests
- Action available to authorised role
- Action blocked for unauthorised role
- Supervisor override where applicable

### 6. Integration Points
- Data flows correctly to downstream center (e.g., PC → CC on FNOL, BC → PC on delinquency)
- External service calls (payment gateway, document generation, email)

---

## Priority Definitions

| Priority | Definition | Target Execution |
|----------|-----------|-----------------|
| **High** | Core business flow; failure blocks users | Every sprint, every build |
| **Medium** | Important feature; workaround exists | Every sprint |
| **Low** | Edge case; minimal business impact | Monthly or on-demand |
