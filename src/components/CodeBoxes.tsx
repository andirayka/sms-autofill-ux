import { StyleSheet, Text, View } from 'react-native';

import { CODE_LENGTH } from '../constants/sms';
import { COLORS } from '../constants/theme';

export function CodeBoxes({ code }: { code: string | null }) {
  return (
    <View style={styles.row} accessibilityLabel="code-boxes">
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const digit = code?.[index];
        return (
          <View
            key={index}
            style={[styles.box, digit ? styles.boxFilled : null]}
          >
            <Text style={styles.digit} testID={`digit-${index}`}>
              {digit ?? ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  box: {
    flex: 1,
    maxWidth: 56,
    height: 72,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.box,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: COLORS.borderFilled,
    backgroundColor: COLORS.boxFilled,
  },
  digit: { color: COLORS.text, fontSize: 38, fontWeight: '700' },
});
