// Registry of action mini-screens consumed by the UrgeHelp orchestrator.
//
// Map structure: action ID → component. The orchestrator looks up the
// active action by id and renders the matching screen with `onDone` and
// `onBack` callbacks. Keeping the registry here (separate from urgeData.ts)
// preserves urgeData.ts as a JSX-free pure data module.
//
// `future_self_letter` is intentionally absent from this registry (Issue
// #65): its screen needs letter + onSaveLetter props that come from App-
// level state, so UrgeHelp imports and renders it directly. The remaining
// 9 screens have the uniform `(onDone, onBack)` signature and stay here.

import type { UrgeActionId } from '../../types';
import { BoxBreathingScreen } from './BoxBreathingScreen';
import { ColdWaterScreen } from './ColdWaterScreen';
import { PhysicalBurstScreen } from './PhysicalBurstScreen';
import { Grounding54321Screen } from './Grounding54321Screen';
import { HALTCheckScreen } from './HALTCheckScreen';
import { LeaveRoomScreen } from './LeaveRoomScreen';
import { PhoneAwayScreen } from './PhoneAwayScreen';
import { UrgeJournalScreen } from './UrgeJournalScreen';
import { PlayTheTapeScreen } from './PlayTheTapeScreen';

export interface UrgeActionScreenProps {
  onDone: () => void;
  onBack: () => void;
}

/** IDs handled by the generic registry. `future_self_letter` is excluded
 *  — UrgeHelp renders it directly with letter-specific props. */
export type GenericUrgeActionId = Exclude<UrgeActionId, 'future_self_letter'>;

export const URGE_ACTION_SCREENS: Record<
  GenericUrgeActionId,
  React.ComponentType<UrgeActionScreenProps>
> = {
  box_breathing: BoxBreathingScreen,
  cold_water: ColdWaterScreen,
  physical_burst: PhysicalBurstScreen,
  grounding_54321: Grounding54321Screen,
  halt_check: HALTCheckScreen,
  leave_room: LeaveRoomScreen,
  phone_away: PhoneAwayScreen,
  urge_journal: UrgeJournalScreen,
  play_the_tape: PlayTheTapeScreen,
};

// Re-export the shell so external consumers (Settings letter editor, future
// onboarding) can reuse it without reaching into the action sub-tree.
export { ActionScreenShell } from './ActionScreenShell';
