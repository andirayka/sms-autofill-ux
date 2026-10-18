import { useCallback, useEffect, useState } from 'react';

import SmsRetriever from '../../modules/sms-retriever';
import { extractCode } from './otp';

export type AutofillStatus = 'listening' | 'filled' | 'timeout' | 'error';

export type SmsAutofill = {
  status: AutofillStatus;
  code: string | null;
  hashes: string[];
  listen: () => void;
};

/**
 * Owns the SMS Retriever window. Listeners are removed on unmount and the
 * native window is stopped, so a closed screen never keeps a receiver alive.
 */
export function useSmsAutofill(): SmsAutofill {
  const [status, setStatus] = useState<AutofillStatus>('listening');
  const [code, setCode] = useState<string | null>(null);
  const [hashes, setHashes] = useState<string[]>([]);
  const [session, setSession] = useState(0);

  useEffect(() => {
    let alive = true;
    SmsRetriever.getAppHashes()
      .then((value) => alive && setHashes(value))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const onSms = SmsRetriever.addListener('onSms', ({ message }) => {
      const found = extractCode(message);
      // A matching SMS without a code is not a result; keep waiting for the
      // next one by re-arming the window.
      if (!found) {
        SmsRetriever.start().catch(() => alive && setStatus('error'));
        return;
      }
      setCode(found);
      setStatus('filled');
    });
    const onTimeout = SmsRetriever.addListener('onTimeout', () =>
      setStatus('timeout'),
    );

    SmsRetriever.start().catch(() => alive && setStatus('error'));

    return () => {
      alive = false;
      onSms.remove();
      onTimeout.remove();
      SmsRetriever.stop().catch(() => undefined);
    };
  }, [session]);

  const listen = useCallback(() => {
    setCode(null);
    setStatus('listening');
    setSession((value) => value + 1);
  }, []);

  return { status, code, hashes, listen };
}
