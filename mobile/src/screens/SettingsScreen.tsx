/**
 * Settings screen — port of the WP7 Panorama's second item
 * (SettingsViewmodel).
 *
 * Instrument / skip / tempo / digit-count pickers, loop-sound and
 * precomputed switches, and the full-screen "Calculating Pi…" overlay
 * with live progress and cancel, wired to pi-calculator's callbacks.
 */

import { useCallback } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import {
  cancelCalculation,
  startCalculation,
  switchToPrecomputed,
} from '../playback';
import { INSTRUMENTS } from '../lib/notes';
import { useCalculationStore } from '../state/calculation';
import {
  COMPUTED_DIGIT_OPTIONS,
  SKIP_OPTIONS,
  TEMPO_OPTIONS,
  useSettingsStore,
} from '../state/settings';
import { colors, fontSizes, spacing } from '../ui/theme';

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

function ThemedPicker({
  testID,
  selectedValue,
  onValueChange,
  children,
}: {
  testID: string;
  selectedValue: number;
  onValueChange: (value: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Picker
      testID={testID}
      selectedValue={selectedValue}
      onValueChange={(value) => onValueChange(Number(value))}
      style={styles.picker}
      itemStyle={styles.pickerItem}
      dropdownIconColor={colors.accent}
    >
      {children}
    </Picker>
  );
}

export function SettingsScreen() {
  const instrumentId = useSettingsStore((s) => s.instrumentId);
  const skipStep = useSettingsStore((s) => s.skipStep);
  const tempoMs = useSettingsStore((s) => s.tempoMs);
  const digitCount = useSettingsStore((s) => s.digitCount);
  const loopSound = useSettingsStore((s) => s.loopSound);
  const usePrecomputed = useSettingsStore((s) => s.usePrecomputed);
  const setInstrumentId = useSettingsStore((s) => s.setInstrumentId);
  const setSkipStep = useSettingsStore((s) => s.setSkipStep);
  const setTempoMs = useSettingsStore((s) => s.setTempoMs);
  const setDigitCount = useSettingsStore((s) => s.setDigitCount);
  const setLoopSound = useSettingsStore((s) => s.setLoopSound);
  const setUsePrecomputed = useSettingsStore((s) => s.setUsePrecomputed);

  const isCalculating = useCalculationStore((s) => s.isCalculating);
  const progressDigit = useCalculationStore((s) => s.progressDigit);
  const calcStart = useCalculationStore((s) => s.start);
  const calcSetProgress = useCalculationStore((s) => s.setProgress);
  const calcFinish = useCalculationStore((s) => s.finish);

  const onTogglePrecomputed = useCallback(
    (value: boolean) => {
      if (value) {
        switchToPrecomputed();
        return;
      }
      // Switch to the Machin calculator: show the overlay, run with live
      // progress, and keep the precomputed source if the user cancels.
      setUsePrecomputed(false);
      calcStart();
      startCalculation(digitCount, (digitIndex) =>
        calcSetProgress(digitIndex),
      ).then(() => {
        calcFinish();
      });
    },
    [calcFinish, calcSetProgress, calcStart, digitCount, setUsePrecomputed],
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SettingRow label="Instrument">
          <ThemedPicker
            testID="picker-instrument"
            selectedValue={instrumentId}
            onValueChange={setInstrumentId}
          >
            {INSTRUMENTS.map((instrument) => (
              <Picker.Item
                key={instrument.id}
                label={instrument.name}
                value={instrument.id}
              />
            ))}
          </ThemedPicker>
        </SettingRow>

        <SettingRow label="Previous/Next Skip">
          <ThemedPicker
            testID="picker-skip"
            selectedValue={skipStep}
            onValueChange={setSkipStep}
          >
            {SKIP_OPTIONS.map((option) => (
              <Picker.Item
                key={option}
                label={option === 1 ? '1 digit' : `${option} digits`}
                value={option}
              />
            ))}
          </ThemedPicker>
        </SettingRow>

        <SettingRow label="Tempo (milliseconds)">
          <ThemedPicker
            testID="picker-tempo"
            selectedValue={tempoMs}
            onValueChange={setTempoMs}
          >
            {TEMPO_OPTIONS.map((option) => (
              <Picker.Item
                key={option}
                label={`${option} ms`}
                value={option}
              />
            ))}
          </ThemedPicker>
        </SettingRow>

        {usePrecomputed ? (
          <SettingRow label="Number of Pi Digits">
            <Text style={styles.staticValue}>1,000,000 (from file)</Text>
          </SettingRow>
        ) : (
          <SettingRow label="Number of Pi Digits">
            <ThemedPicker
              testID="picker-digits"
              selectedValue={digitCount}
              onValueChange={setDigitCount}
            >
              {COMPUTED_DIGIT_OPTIONS.map((option) => (
                <Picker.Item
                  key={option}
                  label={option.toLocaleString()}
                  value={option}
                />
              ))}
            </ThemedPicker>
          </SettingRow>
        )}

        <SettingRow label="Loop Sound">
          <Switch
            testID="switch-loop"
            value={loopSound}
            onValueChange={setLoopSound}
            trackColor={{ false: colors.border, true: colors.accentDim }}
            thumbColor={loopSound ? colors.accent : colors.muted}
          />
        </SettingRow>

        <SettingRow label="Precomputed Digits">
          <Switch
            testID="switch-precomputed"
            value={usePrecomputed}
            onValueChange={onTogglePrecomputed}
            trackColor={{ false: colors.border, true: colors.accentDim }}
            thumbColor={usePrecomputed ? colors.accent : colors.muted}
          />
        </SettingRow>
      </ScrollView>

      <Modal
        visible={isCalculating}
        animationType="fade"
        testID="calc-overlay"
        onRequestClose={() => cancelCalculation()}
      >
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>
            Calculating Pi. This might take some time. This popup will close
            when it&apos;s finished. You can continue to play notes using the
            current value. Tap the button below to cancel.
          </Text>
          <Text testID="calc-progress" style={styles.overlayProgress}>
            Digit {progressDigit.toLocaleString()}
          </Text>
          <TouchableOpacity
            testID="calc-cancel"
            style={styles.cancelButton}
            onPress={() => cancelCalculation()}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={64} color={colors.danger} />
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
  },
  row: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  rowLabel: {
    color: colors.accent,
    fontSize: fontSizes.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  rowControl: {
    minHeight: 48,
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.surface,
  },
  pickerItem: {
    color: colors.text,
  },
  staticValue: {
    color: colors.text,
    fontSize: fontSizes.body,
    paddingVertical: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  overlayTitle: {
    color: colors.text,
    fontSize: fontSizes.title,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 30,
  },
  overlayProgress: {
    color: colors.accent,
    fontSize: fontSizes.hero,
    fontStyle: 'italic',
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelLabel: {
    color: colors.muted,
    fontSize: fontSizes.small,
    marginTop: spacing.xs,
  },
});
