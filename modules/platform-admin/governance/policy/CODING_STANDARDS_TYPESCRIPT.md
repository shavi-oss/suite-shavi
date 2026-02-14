# TypeScript Coding Standards

Applies to backend and frontend TypeScript code.

---

## 1. Typing Rules

Forbidden:

- any
- unknown casting bypass
- as unknown as Type
- type suppression

Allowed:

- explicit interfaces
- union types
- generics
- type guards
- discriminated unions

Typing must be explicit and safe.

---

## 2. Naming

Functions → verbNoun  
Services → SomethingService  
Repositories → SomethingRepository  
Controllers → SomethingController

Files should match responsibilities.

---

## 3. Function Rules

Functions must:

- Do one thing
- Be readable
- Avoid side effects
- Be testable

Avoid large functions.

---

## 4. Error Handling

Unexpected states must:

- Fail closed
- Provide clear errors
- Avoid silent failures

Retries must be user-driven.

---

## 5. Imports

Avoid circular dependencies.
Avoid deep cross-layer imports.
