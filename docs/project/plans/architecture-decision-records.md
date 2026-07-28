# Architecture Decision Records

Status: Parked

Former priority: P2

## Goal

Introduce a lightweight architecture decision record system under
`docs/project/decisions` for choices whose alternatives and consequences should
outlive a task conversation.

## Initial Scope

The first conversation should define:

- an index and file naming convention
- decision status vocabulary
- a concise ADR template
- when a change requires an ADR
- how ADRs link to maintained architecture or module documentation
- how superseded decisions point to their replacements

Do not retrospectively recreate every historical decision. Add the first real
ADR only when there is a current decision with meaningful alternatives and
long-term consequences.

## Suggested Record Shape

Each ADR should contain:

- status and date
- context
- considered options
- decision
- consequences and follow-up work
- links to affected maintained documents

## Restart Conditions

- Identify one genuine pending architectural decision to validate the format.
- Keep the template small enough to maintain for a personal site.
- Decide whether numbering is sequential or date-based before creating records.
- Update `docs/project/README.md` with the final decisions-layer convention.

## Context For A Future Conversation

Read:

- `docs/project/README.md`
- `docs/project/architecture.md`
- current module and plan documents related to the selected decision

Inspect the repository history and implementation only as needed to understand
the selected decision; Git history remains the source for implementation
chronology, while ADRs capture rationale and consequences.
