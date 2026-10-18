import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeBoxes } from '../components/CodeBoxes';
import { COPY } from '../constants/sms';
import { COLORS } from '../constants/theme';
import { buildSms, checkSms } from '../sms/otp';
import { useSmsAutofill } from '../sms/useSmsAutofill';

const SAMPLE_CODE = '482913';

export function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const { status, code, hashes, listen } = useSmsAutofill();
  const [showSetup, setShowSetup] = useState(false);

  const hash = hashes[0];
  const sample = hash ? buildSms(SAMPLE_CODE, hash) : null;
  const sampleCheck = sample && hash ? checkSms(sample, hash) : null;

  const statusText =
    status === 'filled'
      ? COPY.filled
      : status === 'timeout'
        ? COPY.timeout
        : status === 'error'
          ? COPY.error
          : COPY.waiting;

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>{COPY.title}</Text>
      <Text style={styles.subtitle}>{COPY.subtitle}</Text>

      <View style={styles.boxes}>
        <CodeBoxes code={code} />
      </View>

      <Pressable
        disabled={status === 'listening' || status === 'filled'}
        onPress={listen}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.status,
            status === 'filled' && styles.statusFilled,
            (status === 'timeout' || status === 'error') && styles.statusWarn,
          ]}
        >
          {statusText}
        </Text>
      </Pressable>

      <View style={styles.spacer} />

      <Pressable
        onPress={() => setShowSetup((value) => !value)}
        accessibilityRole="button"
      >
        <Text style={styles.setupToggle}>
          {showSetup ? COPY.setupHide : COPY.setup}
        </Text>
      </Pressable>
      {showSetup && (
        <View style={styles.setup}>
          <Text style={styles.setupHint}>{COPY.setupHint}</Text>
          <Text style={styles.setupText} selectable testID="prepared-sms">
            {sample ?? '…'}
          </Text>
          {sampleCheck && !sampleCheck.ok && (
            <Text style={styles.statusWarn}>{sampleCheck.reason}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  boxes: { marginTop: 48, marginBottom: 36 },
  status: {
    color: COLORS.muted,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusFilled: { color: COLORS.accent },
  statusWarn: { color: COLORS.warning, textAlign: 'center' },
  spacer: { flex: 1 },
  setupToggle: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
  setup: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.box,
  },
  setupHint: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  setupText: { color: COLORS.text, fontSize: 14 },
});
