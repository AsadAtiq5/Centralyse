# End-To-End QA Workflow with Natural Language

## Workflow Overview

This prompt guides you through a complete **6-step QA workflow** using MCP servers
and AI Agents to go from a user story to an executed test report.

---

## STEP 1: Read User Story

**Prompt:**

> I need to start a new testing workflow. Please read the user story from the file:
> `UserStories/Login.md`
> Summarize the key requirements and testing scope.

**Expected Output:**

- Summary of the user story
- Application URL and credentials
- Key features to list

---

## STEP 2: Create Test Plan

**Prompt:**

> Based on the user story `Login.md` that we just reviewed, use the
> **playwright-test-planner** agent to:
>
> 1. Read the story
> 2. Explore the application and understand all the workflows mentioned in the user story
> 3. Create a comprehensive test plan that covers all the acceptance criteria
> 4. Save the test plan at `specs/login-test-plan.md`
>
> Ensure each test scenario includes:
>
> - Clear test case title with ID and test tags (`@regression` and `@smoke`)
> - Detailed step-by-step instructions
> - Expected result for each step
> - Test data requirements

**Expected Output:**

- Complete test plan markdown file saved to `/specs`
- Organized test scenarios with clear structure
- Browser exploration screenshots if needed

---

## STEP 3: Perform Exploratory Testing

**Prompt:**

> Now I need to perform manual exploratory testing using the Playwright MCP browser tool.
> Please read the test plan from `/specs/login-test-plan.md`.
> Then execute the scenarios defined in the test plan:
>
> 1. Use the Playwright browser tool to manually execute each test scenario from the plan
> 2. Follow the step-by-step instructions in each test case
> 3. Verify expected results match actual results
> 4. Take screenshots at key steps and error states
> 5. Document your findings:
>    - Test execution results for each scenario
>    - Any UI inconsistencies or unexpected behaviour
>    - Missing validations or bugs discovered
>    - Screenshots as evidence

**Expected Output:**

- Manual test execution results
- Screenshots of the application at various states
- List of observations and findings
- Any issues discovered during exploration

---

## STEP 4: Generate Automation Scripts

**Prompt:**

> Now I need to create automated test scripts using the **playwright-test-generator** agent.
> Please review:
>
> 1. Test plan from `/specs/login-test-plan.md`
> 2. Exploratory testing results from STEP 3 (for actual element selectors and UI insights)
>
> Using insights from the manual exploratory testing:
>
> - Use stable element properties (IDs, data attributes, roles) discovered during exploration
> - Apply wait strategies and UI behaviour observed during manual testing
> - Incorporate any workarounds for UI quirks discovered
>
> Generate Playwright automation scripts that:
>
> - Automate functional and regression coverage for each user story
> - Keep tests maintainable through the Page Object Model (POM)
> - Reuse data captured from the website across specs via a shared data store
> - Run reliably in CI (GitHub Actions) with appropriate timeouts and delays

### Project Structure & Conventions

> The `Client` segment is a placeholder for the product/area under test
> (e.g. `Centralyse`, `Admin`, `Risk`). Use one folder per client/area.

#### Specs — one folder per story

Every user story gets its **own folder** containing its spec file(s):

```
tests/
└── Client/
    └── <story-id-or-name>/
        └── <feature>.spec.ts
```

- One folder per story keeps related scenarios grouped and isolated.
- Spec files contain **only** test orchestration and assertions — no raw selectors.

#### Pages — one method file per spec

Every spec file has a **corresponding Page Object** that holds locators and
reusable actions (methods):

```
Pages/
└── Client/
    └── <feature>.page.ts   // or .js
```

- All selectors/locators live here (prefer `data-test`, role, or label selectors).
- Specs import the page object and call its methods — never touch selectors directly.

#### Test Data — shared store

Any data captured from the website (IDs, generated names, created records, tokens,
etc.) that may be reused by **other specs** must be persisted to:

```
Testdata/
└── Client/
    └── client.json
```

- Write to `client.json` after creating/saving data on the site.
- Read from `client.json` in dependent specs instead of re-creating data.
- Treat the file as a key/value store keyed by a stable, descriptive name.

> After generating the scripts, run the tests to verify they pass.

---

## STEP 5: Create Test Report

**Prompt:**

> Now I need to create a comprehensive test execution report based on manual testing
> and automation execution. Please compile results from:
>
> - Step 3: Manual exploratory testing results
> - Step 4: Generated automation scripts
>
> Structure the report as `test-results/Login-test-report.md`. Include:
>
> 1. **Executive Summary:**
>    - Total test cases planned
>    - Test cases executed (Manual + Automated)
>    - Overall passed/failed/blocked status
> 2. **Manual Test Results:**
>    - Results from Step 3 exploratory testing
>    - Screenshots and observations
>    - Issues found during manual testing
> 3. **Automated Test Results:**
>    - Initial automation results from Step 4
>    - Healing activities performed
>    - Final test execution results after healing
>    - Pass/Fail count
> 4. **Defect Log:** for any failed test (manual or automated)
>    - Bug ID
>    - Severity (Critical/High/Medium/Low)
>    - Title and Description
>    - Steps to reproduce
>    - Expected vs actual behaviour
>    - Screenshots as evidence
> 5. **Test Coverage Analysis:**
>    - Coverage for manual and automated tests
>    - Any gaps in test coverage
>    - Recommendations for additional testing
> 6. **Summary and Recommendations:**
>    - Overall quality assessment
>    - Risk areas
>    - Next steps
