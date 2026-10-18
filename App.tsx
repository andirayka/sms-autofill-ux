import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VerifyScreen } from './src/screens/VerifyScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <VerifyScreen />
    </SafeAreaProvider>
  );
}
