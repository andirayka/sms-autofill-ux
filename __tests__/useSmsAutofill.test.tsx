import { act, renderHook, waitFor } from '@testing-library/react-native';

import SmsRetriever from '../modules/sms-retriever';
import { useSmsAutofill } from '../src/sms/useSmsAutofill';

type Handlers = Record<string, (payload?: unknown) => void>;

jest.mock('../modules/sms-retriever', () => ({
  __esModule: true,
  default: {
    getAppHashes: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    addListener: jest.fn(),
  },
}));

const mock = SmsRetriever as unknown as {
  getAppHashes: jest.Mock;
  start: jest.Mock;
  stop: jest.Mock;
  addListener: jest.Mock;
};

let handlers: Handlers;
let removed: string[];

beforeEach(() => {
  handlers = {};
  removed = [];
  mock.getAppHashes.mockResolvedValue(['FA+9qCX9VSu']);
  mock.start.mockResolvedValue(undefined);
  mock.stop.mockResolvedValue(undefined);
  mock.addListener.mockImplementation(
    (name: string, handler: (payload?: unknown) => void) => {
      handlers[name] = handler;
      return { remove: () => removed.push(name) };
    },
  );
});

afterEach(() => jest.clearAllMocks());

it('starts listening and loads the app hash', async () => {
  const { result } = await renderHook(() => useSmsAutofill());
  expect(result.current.status).toBe('listening');
  expect(result.current.code).toBeNull();
  await waitFor(() => expect(result.current.hashes).toEqual(['FA+9qCX9VSu']));
  expect(mock.start).toHaveBeenCalledTimes(1);
});

it('fills the code when a matching SMS arrives', async () => {
  const { result } = await renderHook(() => useSmsAutofill());
  await act(async () =>
    handlers.onSms({ message: 'Your demo code is 482913\nFA+9qCX9VSu' }),
  );
  expect(result.current.status).toBe('filled');
  expect(result.current.code).toBe('482913');
});

it('keeps waiting and re-arms when the SMS has no code', async () => {
  const { result } = await renderHook(() => useSmsAutofill());
  await act(async () =>
    handlers.onSms({ message: 'Hello there\nFA+9qCX9VSu' }),
  );
  expect(result.current.status).toBe('listening');
  expect(result.current.code).toBeNull();
  expect(mock.start).toHaveBeenCalledTimes(2);
});

it('reports a timeout, and listen() starts a fresh window', async () => {
  const { result } = await renderHook(() => useSmsAutofill());
  await act(async () => handlers.onTimeout());
  expect(result.current.status).toBe('timeout');
  await act(async () => result.current.listen());
  expect(result.current.status).toBe('listening');
  expect(mock.start).toHaveBeenCalledTimes(2);
});

it('reports an error when the native start fails', async () => {
  mock.start.mockRejectedValueOnce(new Error('no play services'));
  const { result } = await renderHook(() => useSmsAutofill());
  await waitFor(() => expect(result.current.status).toBe('error'));
});

it('removes listeners and stops the native window on unmount', async () => {
  const { unmount } = await renderHook(() => useSmsAutofill());
  await unmount();
  expect(removed.sort()).toEqual(['onSms', 'onTimeout']);
  expect(mock.stop).toHaveBeenCalledTimes(1);
});
