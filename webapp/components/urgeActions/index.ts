// Registry of action mini-screens consumed by the UrgeHelp orchestrator.
//
// Map structure: action ID → component. The orchestrator looks up the
// active action by id and renders the matching screen with `onDone` and
// `onBack` callbacks. Keeping the registry here (separate from urgeData.ts)
// preserves urgeData.ts as a JSX-free pure data module.

import type { UrgeActionId } from '../../types';
import { BoxBreathingScreen } from './BoxBreathingScreen';
import { ColdWaterScreen } from './ColdWaterScreen';
import { PhysicalBurstScreen } from './PhysicalBurstScreen';
import { Grounding54321Screen } from './Grounding54321Screen';
import { HALTCheckScreen } from './HALTCheckScreen';
import { LeaveRoomScreen } from './LeaveRoomScreen';
import { PhoneAwayScreen } from './PhoneAwayScreen';
import { UrgeJournalScreen } from './UrgeJournalScreen';
import { FutureSelfLetterScreen } from './FutureSelfLetterScreen';
import { PlayTheTapeScreen } from './PlayTheTapeScreen';

export interface UrgeActionScreenProps {
  onDone: () => void;
  onBack: () => void;
}

export const URGE_ACTION_SCREENS: Record<
  UrgeActionId,
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
  future_self_letter: FutureSelfLetterScreen,
  play_the_tape: PlayTheTapeScreen,
};

// Re-export the shell so external consumers (Settings letter editor, future
// onboarding) can reuse it without reaching into the action sub-tree.
export { ActionScreenShell } from './ActionScreenShell';
