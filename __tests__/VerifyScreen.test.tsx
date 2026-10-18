import { act, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SmsRetriever from '../modules/sms-retriever';
import { VerifyScreen } from '../src/screens/VerifyScreen';

let handlers: Record<string, (payload?: unknown) => void> = {};

jest.mock('../modules/sms-retriever', () => ({
  __esModule: true,
  default: {
    getAppHashes: jest.fn().mockResolvedValue(['FA+9qCX9VSu']),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn(),
  },
}));

beforeEach(() => {
  handlers = {};
  (SmsRetriever.addListener as unknown as jest.Mock).mockImplementation(
    (name: string, handler: (payload?: unknown) => void) => {
      handlers[name] = handler;
      return { remove: jest.fn() };
    },
  );
});

const renderScreen = async () =>
  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 360, height: 800 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <VerifyScreen />
    </SafeAreaProvider>,
  );

it('shows empty boxes and the waiting state first (control)', async () => {
  await renderScreen();
  expect(screen.getByText('Waiting for SMS…')).toBeTruthy();
  for (let i = 0; i < 6; i++) {
    expect(screen.getByTestId(`digit-${i}`).props.children).toBe('');
  }
});

it('fills each box and shows the filled state after the SMS', async () => {
  await renderScreen();
  await act(async () =>
    handlers.onSms({ message: 'Your demo code is 482913\nFA+9qCX9VSu' }),
  );
  expect(screen.getByText('Code filled automatically')).toBeTruthy();
  '482913'.split('').forEach((digit, i) => {
    expect(screen.getByTestId(`digit-${i}`).props.children).toBe(digit);
  });
});

it('offers to listen again after a timeout', async () => {
  await renderScreen();
  await act(async () => handlers.onTimeout());
  expect(screen.getByText('No SMS arrived. Tap to listen again.')).toBeTruthy();
});
