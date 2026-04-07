import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GuidedSession {
  patternId: string;
  currentStep: number;
  completedSteps: number[];
  sessionStartTime: number;
  lastActiveTime: number;
  stepStartTimes: Record<number, number>;
  stepCompletionTimes: Record<number, number>;
}

interface GuidedState {
  sessions: Record<string, GuidedSession>;

  getSession: (patternId: string) => GuidedSession | null;
  startSession: (patternId: string) => void;
  setCurrentStep: (patternId: string, step: number) => void;
  markStepComplete: (patternId: string, step: number) => void;
  unmarkStepComplete: (patternId: string, step: number) => void;
  updateActivity: (patternId: string) => void;
}

export const useGuidedStore = create<GuidedState>()(
  persist(
    (set, get) => ({
      sessions: {},

      getSession: (patternId) => get().sessions[patternId] ?? null,

      startSession: (patternId) => {
        const existing = get().sessions[patternId];
        if (existing) {
          set({
            sessions: {
              ...get().sessions,
              [patternId]: { ...existing, lastActiveTime: Date.now() },
            },
          });
        } else {
          const now = Date.now();
          set({
            sessions: {
              ...get().sessions,
              [patternId]: {
                patternId,
                currentStep: 0,
                completedSteps: [],
                sessionStartTime: now,
                lastActiveTime: now,
                stepStartTimes: { 0: now },
                stepCompletionTimes: {},
              },
            },
          });
        }
      },

      setCurrentStep: (patternId, step) => {
        const session = get().sessions[patternId];
        if (!session) return;
        set({
          sessions: {
            ...get().sessions,
            [patternId]: {
              ...session,
              currentStep: step,
              lastActiveTime: Date.now(),
              stepStartTimes: {
                ...session.stepStartTimes,
                [step]: session.stepStartTimes[step] || Date.now(),
              },
            },
          },
        });
      },

      markStepComplete: (patternId, step) => {
        const session = get().sessions[patternId];
        if (!session) return;
        const completedSteps = session.completedSteps.includes(step)
          ? session.completedSteps
          : [...session.completedSteps, step];
        const now = Date.now();
        const stepStart = session.stepStartTimes[step] || now;
        set({
          sessions: {
            ...get().sessions,
            [patternId]: {
              ...session,
              completedSteps,
              lastActiveTime: now,
              stepCompletionTimes: {
                ...session.stepCompletionTimes,
                [step]: now - stepStart,
              },
            },
          },
        });
      },

      unmarkStepComplete: (patternId, step) => {
        const session = get().sessions[patternId];
        if (!session) return;
        const { [step]: _, ...restTimes } = session.stepCompletionTimes;
        void _;
        set({
          sessions: {
            ...get().sessions,
            [patternId]: {
              ...session,
              completedSteps: session.completedSteps.filter((s) => s !== step),
              lastActiveTime: Date.now(),
              stepCompletionTimes: restTimes,
            },
          },
        });
      },

      updateActivity: (patternId) => {
        const session = get().sessions[patternId];
        if (!session) return;
        set({
          sessions: {
            ...get().sessions,
            [patternId]: { ...session, lastActiveTime: Date.now() },
          },
        });
      },
    }),
    { name: "quiltographer-guided-progress" }
  )
);

/** Format milliseconds into a human-readable duration */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 1) return "less than a minute";
  if (totalMinutes === 1) return "1 minute";
  if (totalMinutes < 60) return `${totalMinutes} minutes`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${mins}m`;
}

/** Estimate remaining time from average step completion */
export function estimateRemaining(
  session: GuidedSession,
  totalSteps: number
): string {
  const times = Object.values(session.stepCompletionTimes);
  if (times.length === 0) return "estimating...";
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const remaining = totalSteps - session.completedSteps.length;
  return formatDuration(avgMs * remaining);
}
