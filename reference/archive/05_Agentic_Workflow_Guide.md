# Agentic Workflow Guide

Working with AI agents (Antigravity, Codex, Claude) requires discipline, especially in a 1-week hackathon. If multiple agents edit the same files without constraints, the repo will break.

## Core Principles
1.  **AI is the Typist, You are the Architect:** Do not ask an agent to "Build the backend." Give it specific, bounded tasks.
2.  **Strict Bounding:** Tell the agent exactly which files it is allowed to read and edit.
3.  **One Feature, One Branch/Agent:** Isolate work.
4.  **Enforce Contracts:** Ensure the agent follows the exact API specs and DB schemas defined in `docs/`.

## How to Prompt Agents

### Bad Prompt ❌
> "Make a page for the officer to do inspections offline."

### Good Prompt ✅
> "You are an expert React PWA developer. I need you to implement Task FE-03: The Offline Inspection Form.
> 
> **Context:**
> Read `docs/01_PRD.md` and `docs/02_Architecture_and_Cryptography.md` to understand the goal.
> Read `docs/07_API_Contracts.md` to see the payload structure for `/api/inspections/sync`.
> 
> **Task:**
> Create a React component in `apps/field-app/src/components/InspectionForm.tsx`.
> It must have fields for: standard weight, machine reading, and error.
> It must use `dexie.js` to save this data to a local IndexedDB table called `pending_inspections` when the 'Save' button is clicked.
> 
> **Constraints:**
> Do NOT touch the routing or authentication files. Use Tailwind for styling. Write a simple unit test for the calculation logic."

## Workflow for Team Members
1.  Pick a task from the Execution Plan.
2.  Open Antigravity / Claude.
3.  Feed it the relevant `docs/` files for context.
4.  Give a strict, bounded prompt.
5.  **Review the code** before accepting the changes. Ensure it doesn't hallucinate missing dependencies.
6.  Test locally, then merge.
