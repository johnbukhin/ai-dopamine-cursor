import React, { useMemo } from 'react';
import {
  Trophy,
  Award,
  Waves,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  ListOrdered,
} from 'lucide-react';
import type { CheckIn, UrgeLogEntry } from '../types';
import { ProgressPeak } from './HeroVariants';
import {
  actionEffectivenessAll,
  timeOfDayBuckets,
  outcomeBreakdown,
  bestStreak,
  topFeelings,
  monthlyIntensityTrend,
} from '../src/lib/insightsCalc';

/**
 * Insights page (Issue #73) — lifetime aggregations over `urge_log` and
 * `check_ins`. Achievement-style card grid; inline SVG / CSS for all
 * visualisations so we don't pull in a chart library.
 *
 * Visual logic (issue #73 follow-up): every card uses one unified palette
 * (purple) for text/icons/charts and one consistent layout — header → primary
 * content (metric / list / chart) → mandatory gray subtitle that explains in
 * one line what the card shows. The only intentional colour exception is the
 * passed-vs-escalated split bar, which keeps semantic emerald + rose so the
 * "good outcome / harder outcome" distinction reads at a glance.
 *
 * All math lives in `insightsCalc.ts` so this file is pure layout. The
 * page is paid-only — App.tsx routes free users to ProGate via the
 * existing Coach/Urge Help gating pattern.
 */
interface InsightsProps {
  urgeLog: UrgeLogEntry[];
  checkIns: CheckIn[];
}

/** Sample-size floor for surfacing per-action stats. Mirrored from the
 *  default in `insightsCalc.actionEffectivenessAll`; pinned here too so
 *  empty-state copy can reference the exact threshold. */
const MIN_TRIES = 3;

export const Insights: React.FC<InsightsProps> = ({ urgeLog, checkIns }) => {
  // Memoise the full aggregation pass — the page rerenders on every parent
  // tick (App owns urgeLog + checkIns), but the underlying arrays change
  // only when the user records a new urge or check-in (real-time within
  // session). Single useMemo over a stable object keeps all derived data
  // in lockstep without juggling per-card useMemos. We compute
  // `allActions` once and `slice(0, 3)` for the top card, avoiding the
  // double-pass that calling `topEffectiveActions` would introduce.
  const stats = useMemo(() => {
    const allActions = actionEffectivenessAll(urgeLog, MIN_TRIES);
    return {
      topActions: allActions.slice(0, 3),
      allActions,
      buckets: timeOfDayBuckets(urgeLog),
      outcomes: outcomeBreakdown(urgeLog),
      streak: bestStreak(checkIns),
      feelings: topFeelings(urgeLog, 3),
      trend: monthlyIntensityTrend(urgeLog),
    };
  }, [urgeLog, checkIns]);

  // ── Empty state ─────────────────────────────────────────────────────────
  // First-day users see nothing useful from raw data, so we replace the
  // grid with a motivational hero instead of rendering eight "no data" boxes.
  // Threshold is "no urge sessions yet" — check-ins alone aren't enough to
  // make the patterns meaningful.
  if (urgeLog.length === 0) {
    return (
      <div className="flex-1 h-full overflow-y-auto pb-28 md:pb-8">
        <div className="w-full relative mb-4">
          <ProgressPeak />
          <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
            <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
              Insights
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
              Your patterns
            </h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 md:px-8 -mt-4">
          <div className="bg-white border border-purple-100 rounded-2xl p-6 md:p-8 text-center shadow-sm">
            <Sparkles size={32} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg md:text-xl font-bold text-purple-900 mb-2">
              Your patterns will appear here
            </h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed">
              Open the Help tab the next time you feel an urge — even one
              session is enough to start filling this page. The more you
              practice, the more useful these stats become.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto pb-28 md:pb-8">
      {/* Hero reuses ProgressPeak — it already speaks "tracking" / "summit"
          which fits an Insights surface, and avoids authoring a new SVG. */}
      <div className="w-full relative mb-4">
        <ProgressPeak />
        <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
          <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
            Insights
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
            Your patterns
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopTechniquesCard items={stats.topActions} />
          <TotalSurfsCard outcomes={stats.outcomes} />
          <BestStreakCard streak={stats.streak} />
          <OutcomeRatioCard outcomes={stats.outcomes} />
          <TimeOfDayCard buckets={stats.buckets} />
          <TopFeelingsCard items={stats.feelings} />
          <IntensityTrendCard trend={stats.trend} />
          {/* Full action ranking spans the full row on desktop — its body is
              a list that needs the extra width to keep titles + bars readable. */}
          <div className="md:col-span-2">
            <ActionRankingCard items={stats.allActions} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Shared card scaffold ──────────────────────────────────────────────────

/** Every card has the same three-region layout (header → body → subtitle)
 *  and the same purple palette. The `subtitle` prop is required — that's
 *  the gray, smaller-font one-liner under the metric that explains what the
 *  number / chart means at a glance (issue #73 follow-up). */
interface CardShellProps {
  index: number;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtitle: string;
  children: React.ReactNode;
}

const CardShell: React.FC<CardShellProps> = ({ index, Icon, label, subtitle, children }) => (
  <div
    className="bg-white border border-purple-100 rounded-2xl p-5 md:p-6 shadow-sm
               animate-in fade-in slide-in-from-bottom-2 duration-500
               flex flex-col"
    style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="bg-purple-100 text-purple-700 p-1.5 rounded-lg">
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">
        {label}
      </span>
    </div>
    <div className="flex-1">{children}</div>
    <p className="text-xs text-stone-500 mt-3">{subtitle}</p>
  </div>
);

/** Inline "need more data" placeholder used by cards that need a minimum
 *  sample size. Same typography as the surrounding metric so the empty
 *  state doesn't feel like a different surface. */
const NeedMore: React.FC<{ hint: string }> = ({ hint }) => (
  <p className="text-sm text-stone-500 leading-relaxed">{hint}</p>
);

// ─── Shared metric primitives ──────────────────────────────────────────────
// Single typography hierarchy used by every numeric card so the grid reads
// as one coherent surface instead of eight slightly-different stat blocks.

/** Big number + small unit on the same baseline. */
const BigMetric: React.FC<{ value: string; unit?: string }> = ({ value, unit }) => (
  <div className="flex items-baseline gap-1.5">
    <span className="text-3xl md:text-4xl font-bold text-purple-900 tabular-nums">{value}</span>
    {unit && <span className="text-lg font-semibold text-purple-700">{unit}</span>}
  </div>
);

// ─── Card 1: Top 3 most-effective techniques ───────────────────────────────

const TopTechniquesCard: React.FC<{
  items: ReturnType<typeof actionEffectivenessAll>;
}> = ({ items }) => (
  <CardShell
    index={0}
    Icon={Trophy}
    label="Top techniques"
    subtitle="Top 3 actions ranked by how often they helped the urge pass."
  >
    {items.length === 0 ? (
      <NeedMore hint={`Need at least ${MIN_TRIES} tries of any technique to surface a winner.`} />
    ) : (
      <ol className="space-y-3">
        {items.map((a, i) => (
          <li key={a.id} className="flex items-baseline justify-between gap-3">
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="text-xs font-bold text-purple-700 tabular-nums">{i + 1}.</span>
              <span className="text-sm font-semibold text-purple-900 truncate">{a.title}</span>
            </span>
            <span className="text-sm font-bold text-purple-900 tabular-nums flex-shrink-0">
              {Math.round(a.successRate * 100)}%
            </span>
          </li>
        ))}
      </ol>
    )}
  </CardShell>
);

// ─── Card 2: Total surfs ──────────────────────────────────────────────────

const TotalSurfsCard: React.FC<{ outcomes: ReturnType<typeof outcomeBreakdown> }> = ({
  outcomes,
}) => (
  <CardShell
    index={1}
    Icon={Waves}
    label="Total surfs"
    subtitle="Urges you've faced, all-time — with how each session resolved."
  >
    <BigMetric value={String(outcomes.total)} unit={outcomes.total === 1 ? 'urge' : 'urges'} />
    <p className="text-xs text-purple-700/70 mt-1.5 tabular-nums">
      {outcomes.passed} passed · {outcomes.stillHere} re-tried · {outcomes.escalated} escalated
    </p>
  </CardShell>
);

// ─── Card 3: Best streak ──────────────────────────────────────────────────

const BestStreakCard: React.FC<{ streak: number }> = ({ streak }) => (
  <CardShell
    index={2}
    Icon={Award}
    label="Best streak"
    subtitle="Longest stretch of consecutive clean days on record."
  >
    <BigMetric value={String(streak)} unit={streak === 1 ? 'day' : 'days'} />
  </CardShell>
);

// ─── Card 4: Passed vs Escalated ratio (split bar) ────────────────────────

const OutcomeRatioCard: React.FC<{ outcomes: ReturnType<typeof outcomeBreakdown> }> = ({
  outcomes,
}) => {
  // Only the two terminal outcomes are charted — `still_here` is mid-session
  // and would skew the "did this resolve well?" question this card answers.
  const total = outcomes.passed + outcomes.escalated;
  const passedPct = total === 0 ? 0 : (outcomes.passed / total) * 100;
  const escalatedPct = 100 - passedPct;
  return (
    <CardShell
      index={3}
      Icon={Sparkles}
      label="Resolution rate"
      subtitle="Share of finished sessions where the urge passed vs. escalated."
    >
      {total === 0 ? (
        <NeedMore hint="Resolve one urge session (passed or escalated) to see this ratio." />
      ) : (
        <>
          <BigMetric value={`${Math.round(passedPct)}%`} unit="passed" />
          {/* Semantic split bar — emerald = good outcome, rose = harder
              outcome. Kept as a colour-coded exception to the purple
              palette because passed-vs-escalated is the one place where
              chart colour carries real meaning. `min-w-[2px]` ensures a
              non-zero segment is still visually present when its share
              rounds toward zero. */}
          <div
            className="flex h-3 rounded-full overflow-hidden bg-stone-100 mt-3"
            role="img"
            aria-label={`${outcomes.passed} passed, ${outcomes.escalated} escalated`}
          >
            <div className="bg-emerald-500 min-w-[2px]" style={{ width: `${passedPct}%` }} />
            <div className="bg-rose-400 min-w-[2px]" style={{ width: `${escalatedPct}%` }} />
          </div>
          <p className="text-xs text-purple-700/70 mt-2 tabular-nums">
            {outcomes.passed} passed · {outcomes.escalated} escalated
          </p>
        </>
      )}
    </CardShell>
  );
};

// ─── Card 5: Triggers by time of day (4-bucket bar chart) ─────────────────

const TimeOfDayCard: React.FC<{ buckets: ReturnType<typeof timeOfDayBuckets> }> = ({
  buckets,
}) => {
  // Four side-by-side bars scaled to the tallest bucket. Comparing relative
  // proportions is the goal here — exact counts sit underneath each bar.
  const entries = [
    { key: 'morning', label: 'AM', long: 'Morning', count: buckets.morning },
    { key: 'afternoon', label: 'Noon', long: 'Afternoon', count: buckets.afternoon },
    { key: 'evening', label: 'Eve', long: 'Evening', count: buckets.evening },
    { key: 'lateNight', label: 'Late', long: 'Late night', count: buckets.lateNight },
  ] as const;
  const max = Math.max(1, ...entries.map((e) => e.count));     // avoid /0
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  return (
    <CardShell
      index={4}
      Icon={Clock}
      label="When urges hit"
      subtitle="Count of urges per daypart bucket (5–12 / 12–17 / 17–22 / 22–5)."
    >
      {total === 0 ? (
        <NeedMore hint="No daypart data yet." />
      ) : (
        <div
          className="flex items-end justify-between gap-2 h-24"
          role="img"
          aria-label="Urges by time-of-day bucket"
        >
          {entries.map((e) => {
            const pct = (e.count / max) * 100;
            return (
              <div key={e.key} className="flex flex-col items-center flex-1 min-w-0 h-full">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-purple-400 rounded-t-md transition-[height] min-h-[2px]"
                    style={{ height: `${pct}%` }}
                    title={`${e.long}: ${e.count}`}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700/70 mt-1.5">
                  {e.label}
                </span>
                <span className="text-[10px] font-bold text-purple-900 tabular-nums">{e.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
};

// ─── Card 6: Top trigger feelings ─────────────────────────────────────────

const TopFeelingsCard: React.FC<{ items: ReturnType<typeof topFeelings> }> = ({ items }) => (
  <CardShell
    index={5}
    Icon={Heart}
    label="Top trigger feelings"
    subtitle="Feelings you named most often when the urge hit."
  >
    {items.length === 0 ? (
      <NeedMore hint="Name a feeling on the Locate stage to seed this card." />
    ) : (
      <ol className="space-y-2">
        {items.map((f) => (
          <li key={f.id}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm font-semibold text-purple-900 truncate">{f.label}</span>
              <span className="text-xs font-bold text-purple-900 tabular-nums flex-shrink-0">
                {Math.round(f.pct * 100)}%
              </span>
            </div>
            {/* Horizontal proportion bar — width relative to "share of all
                feelings named" (already normalised in topFeelings). */}
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${Math.max(2, f.pct * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    )}
  </CardShell>
);

// ─── Card 7: Average intensity trend (inline SVG line) ────────────────────

const IntensityTrendCard: React.FC<{
  trend: ReturnType<typeof monthlyIntensityTrend>;
}> = ({ trend }) => {
  // <2 months of data is too thin to read as a "trend" — fall back to a
  // copy state rather than render a single dot pretending to be a line.
  if (trend.length < 2) {
    return (
      <CardShell
        index={6}
        Icon={TrendingUp}
        label="Intensity trend"
        subtitle="Average urge intensity per month, on the 1–10 self-report scale."
      >
        <NeedMore hint="Need urges across at least 2 months to draw a trend line." />
      </CardShell>
    );
  }
  // Scale points into a fixed-aspect SVG viewBox so layout maths happens
  // once and the chart is resolution-independent.
  const VIEW_W = 280;
  const VIEW_H = 80;
  const PAD = 6;
  const xStep = (VIEW_W - PAD * 2) / Math.max(1, trend.length - 1);
  const points = trend
    .map((m, i) => {
      const x = PAD + i * xStep;
      // Intensity is 1–10 from the slider; invert so higher intensity sits
      // higher on the chart, with PAD margins top and bottom.
      const y = VIEW_H - PAD - ((m.avgIntensity - 1) / 9) * (VIEW_H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const latest = trend[trend.length - 1];
  return (
    <CardShell
      index={6}
      Icon={TrendingUp}
      label="Intensity trend"
      subtitle="Average urge intensity per month, on the 1–10 self-report scale."
    >
      <BigMetric value={latest.avgIntensity.toFixed(1)} unit="/ 10 latest" />
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-20 mt-2"
        role="img"
        aria-label="Average urge intensity per month"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className="text-purple-500"
        />
        {trend.map((m, i) => {
          const x = PAD + i * xStep;
          const y = VIEW_H - PAD - ((m.avgIntensity - 1) / 9) * (VIEW_H - PAD * 2);
          return (
            <circle key={m.month} cx={x} cy={y} r={2.5} className="fill-purple-600" />
          );
        })}
      </svg>
      <p className="text-xs text-purple-700/70 mt-1 tabular-nums">
        {trend.length} {trend.length === 1 ? 'month' : 'months'} of data.
      </p>
    </CardShell>
  );
};

// ─── Card 8: Full action effectiveness ranking ────────────────────────────

const ActionRankingCard: React.FC<{
  items: ReturnType<typeof actionEffectivenessAll>;
}> = ({ items }) => (
  <CardShell
    index={7}
    Icon={ListOrdered}
    label="All techniques ranked"
    subtitle={`Every technique you've tried at least ${MIN_TRIES} times, ranked by success rate.`}
  >
    {items.length === 0 ? (
      <NeedMore hint={`Each technique needs at least ${MIN_TRIES} tries before it appears here.`} />
    ) : (
      <ul className="space-y-2.5">
        {items.map((a) => {
          const pct = Math.round(a.successRate * 100);
          return (
            <li key={a.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-semibold text-purple-900 truncate">{a.title}</span>
                <span className="text-xs text-purple-700 tabular-nums flex-shrink-0">
                  {a.successes}/{a.tries} · {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </CardShell>
);
