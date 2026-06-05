import { NativeModules } from 'react-native';

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

function isClassicWorkout(session: TrainingKitSession): boolean {
  return session.__typename === 'WorkoutBlockSession' || session.format === 'CLASSIC';
}

function isVideoWorkout(session: TrainingKitSession): boolean {
  return session.__typename === 'WorkoutVideoSession' || session.format === 'PLAY';
}
