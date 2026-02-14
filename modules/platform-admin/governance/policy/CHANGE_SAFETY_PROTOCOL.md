# Change Safety Protocol

All modifications must follow this process.

---

## Before Changing Code

Agent must:

1. Read surrounding files
2. Understand architecture
3. Identify impacted areas
4. Prepare minimal diff plan

---

## During Changes

Agent must:

- Modify only scoped files
- Avoid formatting-only changes
- Avoid refactors outside scope

---

## After Changes

Agent must:

- Run lint/build/tests if available
- Review git diff
- Ensure minimal modification
- Confirm behavior unchanged outside scope

---

## Change Principle

Small safe changes beat large risky ones.
