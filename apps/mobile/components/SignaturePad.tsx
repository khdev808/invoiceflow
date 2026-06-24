import { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export function SignaturePad({ onSave, onClear }: Props) {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef('');
  const pathRef = useRef<string[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setPaths([...pathRef.current, currentPath.current]);
      },
      onPanResponderRelease: () => {
        pathRef.current = [...pathRef.current, currentPath.current];
        setPaths([...pathRef.current]);
        currentPath.current = '';
      },
    }),
  ).current;

  const handleClear = () => {
    pathRef.current = [];
    setPaths([]);
    onClear?.();
  };

  const handleSave = () => {
    const signature = paths.length > 0 ? `data:image/svg;paths=${encodeURIComponent(JSON.stringify(paths))}` : '';
    onSave(signature);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Draw your signature</Text>
      <View style={styles.pad} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={colors.text} strokeWidth={2} fill="none" />
          ))}
        </Svg>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Apply Signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  pad: { height: 120, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  clearBtn: { flex: 1, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  clearText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
