import { NativeEventEmitter, NativeModules } from 'react-native';
import type { EmitterSubscription } from 'react-native';

type NativeTrainingKitModule = {
  deviceIdentifier(): string;
  launchClassicWorkout(jsonString: string, token: string): void;
  launchVideoWorkout(jsonString: string, token: string): void;
};

export type TrainingKitSession = {
  __typename?: string;
  format?: string;
  trainingKitToken: string;
  [key: string]: unknown;
};

/** Result data emitted when a workout is saved. Shape mirrors the native SDK's
 * `SaveWorkoutState` (richer on iOS than on Android). */
export type WorkoutSaveData = Record<string, unknown>;

/** Listeners for the workout completion lifecycle. */
export type WorkoutListeners = {
  /** The workout finished and produced a result to persist. */
  onSave?: (data: WorkoutSaveData) => void;
  /** The user quit the workout without completing it. */
  onQuit?: () => void;
  /** A TrainingKit analytics event was emitted during the workout. */
  onEvent?: (name: string, properties: Record<string, unknown>) => void;
};

const WORKOUT_EVENT = 'TrainingKitWorkoutEvent';

const nativeModule = NativeModules.TrainingKitModule as NativeTrainingKitModule | undefined;

function getNativeModule(): NativeTrainingKitModule {
  if (!nativeModule) {
    throw new Error(
      'TrainingKitModule is not available. Make sure trainingkit-reactnative is linked and the native app was rebuilt.',
    );
  }

  return nativeModule;
}

export function deviceIdentifier(): string {
  return getNativeModule().deviceIdentifier();
}

export function launchWorkout(session: TrainingKitSession): void {
  if (!session.trainingKitToken) {
    throw new Error('TrainingKit session is missing trainingKitToken.');
  }

  const jsonString = JSON.stringify(session);
  const module = getNativeModule();

  if (isClassicWorkout(session)) {
    module.launchClassicWorkout(jsonString, session.trainingKitToken);
    return;
  }

  if (isVideoWorkout(session)) {
    module.launchVideoWorkout(jsonString, session.trainingKitToken);
    return;
  }

  throw new Error(`Unsupported TrainingKit session type: ${session.__typename ?? session.format ?? 'unknown'}.`);
}

/**
 * Subscribes to the workout completion lifecycle.
 *
 * Add the listener before calling {@link launchWorkout} so no event is missed.
 * Returns a subscription; call `.remove()` to stop listening.
 */
export function addWorkoutListener(listeners: WorkoutListeners): EmitterSubscription {
  const emitter = new NativeEventEmitter(NativeModules.TrainingKitModule);

  return emitter.addListener(WORKOUT_EVENT, (body: WorkoutEventBody) => {
    switch (body.type) {
      case 'save':
        listeners.onSave?.(parseJson(body.data));
        return;
      case 'quit':
        listeners.onQuit?.();
        return;
      case 'event':
        listeners.onEvent?.(body.name ?? '', parseJson(body.properties));
        return;
    }
  });
}

type WorkoutEventBody = {
  type: 'save' | 'quit' | 'event';
  data?: string;
  name?: string;
  properties?: string;
};

function parseJson(value: string | undefined): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function isClassicWorkout(session: TrainingKitSession): boolean {
  return session.__typename === 'WorkoutBlockSession' || session.format === 'CLASSIC';
}

function isVideoWorkout(session: TrainingKitSession): boolean {
  return session.__typename === 'WorkoutVideoSession' || session.format === 'PLAY';
}
