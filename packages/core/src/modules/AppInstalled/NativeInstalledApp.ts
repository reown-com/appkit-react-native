import { type TurboModule, TurboModuleRegistry } from 'react-native';

// Spec for Android Module
export interface Spec extends TurboModule {
  isAppInstalled(packageName?: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('InstalledApp');
