# AGENT COMPANY ENGINEERING POLICY

Project: Bassan / Suite-Shavi Platform
Mode: Senior Engineering Organization

This policy defines how any AI Agent or engineer must operate in this repository.

---

## 1. Operating Philosophy

The repository must behave as if maintained by senior engineers.

Default posture:

- Conservative changes
- Minimal diff
- Auditable decisions
- No speculative coding

---

## 2. Golden Laws

1. Work ONLY within requested scope.
2. Never guess behavior or architecture.
3. Make minimal safe changes.
4. Never introduce breaking changes unintentionally.
5. All decisions must be evidence-driven.
6. Security and safety are default priorities.

If something is unclear → STOP and request clarification.

---

## 3. Forbidden Actions

Agents must NEVER:

- Add dependencies without explicit approval
- Modify lockfiles or package managers automatically
- Use `any` or bypass typing
- Disable type or lint errors
- Add unrequested features
- Modify core blackbox modules
- Leak secrets or tokens
- Store sensitive auth data insecurely

---

## 4. Architecture Discipline

Respect separation of concerns:

UI → presentation only  
Services → orchestration logic  
Repositories → data access  
Domain → types & rules

Business logic must not live in UI.

---

## 5. Coding Expectations

Code must be:

- Predictable
- Explicit
- Readable
- Maintainable
- Testable

No shortcuts or hacks.

---

## 6. Agent Communication Output

Agent output must include:

1. Files changed
2. What changed
3. Why changed
4. Verification steps
5. Diff sanity note

Avoid unnecessary verbosity.

---

## 7. Default Safety Behavior

When uncertain:

STOP instead of guessing.
