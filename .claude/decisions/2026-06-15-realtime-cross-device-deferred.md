# ADR: Defer Supabase Realtime cross-device sync

**Date:** 2026-06-15
**Status:** Deferred
**Related issues:** #73 (Insights page), #64 (urge_log Supabase migration), #65 (Future-Self Letter Supabase migration)
**Authors:** Yevhen + Claude

## Context

After shipping the Insights page (Issue #73, PR #74) we examined cross-device freshness of the underlying data. Current behaviour:

- `urge_log`, `check_ins`, `coach_messages`, `coach_memory`, `future_self_letter` all live in Supabase Postgres.
- App.tsx fetches all of them **once** in `loadUserData()` after auth and stores them in React state.
- New writes (`handleAppendUrge`, `handleCheckIn`, etc.) do an **optimistic local state update** plus a fire-and-forget `INSERT`/`UPSERT` against Supabase.
- The frontend uses only standard HTTPS — there is **no WebSocket connection** to Supabase.

**The consequence:** data flowing across devices is asymmetric. Device A writes go to Postgres immediately, but Device B's React state only catches up the next time the user signs in (or hard-refreshes), because Device B never asked Postgres again.

Example user pain:
1. User logs an urge on phone.
2. Opens the laptop later and goes to Insights → `urgesCount` shows the count from the laptop's last fetch, missing the phone entry.
3. Refresh fixes it.

## Decision

**We are NOT building cross-device real-time sync at this time.**

When Insights v2 work (Issue #73 follow-up) explicitly evaluated this, we chose to ship the **Time range toggle** (which is pure in-memory filtering and adds zero infra) and to skip the Realtime subscription path. This document captures the rationale so future contributors don't have to re-derive it.

## How the fix would work, if we did build it

Supabase Realtime is a managed service (built on Postgres `LISTEN`/`NOTIFY` + websockets) that broadcasts row-level changes from a watched table to all subscribed clients in real time. The client opens **one persistent WebSocket** to Supabase and registers interest in specific tables + filters.

Frontend implementation would live in `App.tsx`, scoped to the authenticated user. Sketch:

```ts
useEffect(() => {
  if (!isAuthenticated || !supabase || !user?.id) return;

  const channel = supabase
    .channel(`user-data:${user.id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'urge_log', filter: `user_id=eq.${user.id}` },
      (payload) => {
        // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
        // payload.new (or payload.old) carries the row in snake_case
        // → map to UrgeLogEntry, update urgeLogEntries state
        //   with dedup logic so optimistic-update rows aren't double-added
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'check_ins', filter: `user_id=eq.${user.id}` },
      (payload) => { /* same shape for check_ins */ },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isAuthenticated, user?.id]);
```

Backend prerequisite — enable Realtime on the tables we watch:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE urge_log;
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
-- Optionally: future_self_letter, coach_messages, coach_memory
```

RLS policies stay as-is (already filter by `auth.uid() = user_id`). The Realtime layer respects RLS, so other users' rows are never broadcast.

Tables we'd plausibly subscribe to:
- `urge_log` — drives Dashboard "Urges Faced" tile, Insights cards, Coach context block
- `check_ins` — drives Dashboard calendar/streak, Insights, Coach context
- `future_self_letter` — rare writes but cheap to subscribe
- `coach_messages` — would let Coach chat sync mid-session across two open tabs (nice-to-have, not pain-driven)
- `coach_memory` — only changes on `/api/coach-reset`; arguably not worth a subscription

## Pricing

Supabase Realtime is **included in every plan, including free**, with quotas:

| Plan | Concurrent connections | Messages / month |
|---|---|---|
| Free | 200 | 2,000,000 |
| Pro ($25/mo) | 500 | 5,000,000 |
| Team ($599/mo) | 1,000+ | higher |

**"Concurrent connections" = WebSocket sockets open at the same instant**, not registered users. A user with the app closed contributes zero. A user with the app open on two devices contributes two.

Rule-of-thumb headroom on free tier: peak concurrent ≈ 5–10 % of DAU. So 200 concurrent ≈ ~2,000–4,000 DAU at peak hour before we hit the cap. By the time we approach that, $25/mo for the Pro tier is a rounding error.

**Messages** = row changes broadcast to clients. Urges + check-ins are infrequent events, so 2M/month is effectively unbounded for this app shape.

## Why we're not building it now

1. **No reported user pain.** No support ticket, prod log signal, or user feedback has flagged stale cross-device data. The work is preempting a hypothetical complaint, not responding to a real one. Premature optimisation.

2. **Bigger UX wins are queued.** Time range toggle, weekly AI narrative interpretation, journal data integration — each of these moves the Insights page measurably forward. Realtime mostly keeps an already-correct number 30 minutes fresher.

3. **Real implementation cost is medium, not small.** The naive subscribe call is one-liner, but production-quality cross-device sync needs:
   - **Dedup against optimistic updates.** `handleAppendUrge` already pushes the row into local state before the DB INSERT completes. When the Realtime INSERT event fires back, we must NOT re-append the same row. Need a stable identifier comparison.
   - **Reconciliation on WebSocket reconnect.** Mobile networks drop. When the socket reconnects after N seconds, we may have missed events. Either trigger a `loadUserData()` re-fetch on `SUBSCRIBED` after a disconnect, or accept drift.
   - **Cleanup on unmount/logout/user-switch.** Forgetting `removeChannel` leaks sockets and counts toward the concurrent limit.
   - **Test coverage.** This is a primary candidate for the kind of bug that only shows up under flaky-network + multi-tab scenarios. Manual testing alone won't catch every case.

   Realistic budget: ~1 day of focused work + a week of low-grade prod monitoring to make sure nothing leaks.

4. **Concurrent-connection ceiling becomes a new operational concern.** Currently the app has zero infra-side capacity limits we can blow through with a buggy useEffect. Adding Realtime introduces a soft 200 ceiling on free tier — small risk, but it's a new failure mode that needs monitoring.

5. **Polling middle ground exists if the pain is mild.** Before going full Realtime, we could simply re-run `loadUserData()` on `visibilitychange` (when the user returns to the tab). Costs one extra fetch per session resume. Zero new infra surface. Probably gives 80 % of the perceived freshness for 10 % of the work.

## Triggers to revisit

We should reopen this decision if **any** of these become true:

- Multiple distinct users (≥ 3) report stale-data confusion across devices.
- Insights or Coach analytics show a meaningful drop-off when users start a session on one device and continue on another.
- We add **collaborative or social features** (shared check-ins between accountability partners, group challenges, etc.) — those genuinely need push semantics, not eventual consistency.
- We add **a feature whose value depends on second-by-second freshness** (e.g. live coach hand-off between user and a human therapist in the same conversation thread).
- DAU sustains > 5 000 — at that scale, the "Refresh fixed it" workaround starts to feel sloppy regardless of complaints.

## What we did instead (Insights v2 scope)

- **Time range toggle** (`All-time / Last 30 days / Last 7 days`) — added to the Insights page. Pure in-memory filtering over already-loaded React state. Zero new Supabase reads per range change. Costs ~50 lines of code, fits the "малою кров'ю" bar that motivated v2 in the first place.

That's the only Insights v2 change in this round. Other v2 candidates (AI narrative, journal integration, "most effective" causation fix) remain on the backlog.

## References

- Supabase Realtime docs: https://supabase.com/docs/guides/realtime
- Pricing: https://supabase.com/pricing
- Earlier conversation: see Issue #73 PR #74 follow-up discussion
- Related migrations that already moved data to Supabase: `20260613_urge_log.sql`, `20260614_future_self_letter.sql`, `20260603_coach_memory.sql`
