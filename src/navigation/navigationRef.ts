import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Navigate from outside React (toasts, realtime handlers). */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  ...args: undefined extends RootStackParamList[T] ? [RootStackParamList[T]?] : [RootStackParamList[T]]
) {
  if (navigationRef.isReady()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigationRef.navigate as any)(name, args[0]);
  }
}
