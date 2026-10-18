import { NativeModule, requireNativeModule } from 'expo';

import { SmsRetrieverModuleEvents } from './SmsRetriever.types';

declare class SmsRetrieverModule extends NativeModule<SmsRetrieverModuleEvents> {
  getAppHashes(): Promise<string[]>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export default requireNativeModule<SmsRetrieverModule>('SmsRetriever');
