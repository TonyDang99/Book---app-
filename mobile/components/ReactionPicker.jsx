import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { REACTION_EMOJI, REACTION_LABEL, REACTION_TYPES } from "../constants/reactions";

const EDGE_PADDING = 12;
const PICKER_HEIGHT = 58;
const PICKER_GAP = 9;

const playHaptic = (style) => {
  Haptics.impactAsync(style).catch(() => undefined);
};

function ReactionOption({
  type,
  entranceProgress,
  activeReaction,
  disabled,
  colors,
  onSelect,
}) {
  const [highlighted, setHighlighted] = useState(false);
  const pressProgress = useRef(new Animated.Value(0)).current;

  const setPressed = (pressed) => {
    setHighlighted(pressed);
    Animated.spring(pressProgress, {
      toValue: pressed ? 1 : 0,
      speed: 30,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = () => {
    playHaptic(Haptics.ImpactFeedbackStyle.Light);
    onSelect(type);
  };

  const isActive = activeReaction === type;

  return (
    <Animated.View
      style={[
        styles.optionEntrance,
        {
          opacity: entranceProgress,
          transform: [
            {
              translateY: entranceProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
            {
              scale: entranceProgress.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.35, 1.12, 1],
              }),
            },
          ],
        },
      ]}
    >
      {highlighted && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            { backgroundColor: colors.textPrimary, shadowColor: colors.black },
          ]}
        >
          <Text style={[styles.tooltipText, { color: colors.background }]}>
            {REACTION_LABEL[type]}
          </Text>
        </View>
      )}

      <Animated.View
        style={{
          transform: [
            {
              translateY: pressProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              }),
            },
            {
              scale: pressProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.38],
              }),
            },
          ],
        }}
      >
        <Pressable
          disabled={disabled}
          onPress={handleSelect}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onHoverIn={() => setPressed(true)}
          onHoverOut={() => setPressed(false)}
          style={[
            styles.optionButton,
            isActive && { backgroundColor: colors.inputBackground },
          ]}
          accessibilityRole="button"
          accessibilityLabel={REACTION_LABEL[type]}
          accessibilityState={{ selected: isActive, disabled }}
        >
          <Text style={styles.optionEmoji}>{REACTION_EMOJI[type]}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function ReactionPicker({
  visible,
  anchorRef,
  activeReaction,
  colors,
  disabled = false,
  onSelect,
  onDismiss,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [rendered, setRendered] = useState(false);
  const [position, setPosition] = useState(null);
  const visibleRef = useRef(visible);
  const renderedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(0.82)).current;
  const containerTranslateY = useRef(new Animated.Value(8)).current;
  const optionProgress = useRef(REACTION_TYPES.map(() => new Animated.Value(0))).current;

  visibleRef.current = visible;

  useEffect(() => {
    const pickerWidth = Math.min(windowWidth - EDGE_PADDING * 2, 318);

    const startEntranceAnimation = () => {
      containerOpacity.stopAnimation();
      containerScale.stopAnimation();
      containerTranslateY.stopAnimation();
      optionProgress.forEach((progress) => {
        progress.stopAnimation();
        progress.setValue(0);
      });
      containerOpacity.setValue(0);
      containerScale.setValue(0.82);
      containerTranslateY.setValue(8);

      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(containerScale, {
          toValue: 1,
          speed: 22,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(containerTranslateY, {
          toValue: 0,
          speed: 24,
          bounciness: 6,
          useNativeDriver: true,
        }),
        Animated.stagger(
          28,
          optionProgress.map((progress) =>
            Animated.spring(progress, {
              toValue: 1,
              speed: 23,
              bounciness: 10,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    };

    if (visible) {
      renderedRef.current = true;
      setRendered(true);
      setPosition(null);
      Haptics.selectionAsync().catch(() => undefined);
      animationFrameRef.current = requestAnimationFrame(() => {
        const anchor = anchorRef?.current;
        if (!anchor?.measureInWindow) {
          setPosition({
            left: (windowWidth - pickerWidth) / 2,
            top: Math.max(EDGE_PADDING, (windowHeight - PICKER_HEIGHT) / 2),
            width: pickerWidth,
          });
          startEntranceAnimation();
          return;
        }

        anchor.measureInWindow((x, y, width, height) => {
          const preferredTop = y - PICKER_HEIGHT - PICKER_GAP;
          const top =
            preferredTop >= EDGE_PADDING
              ? preferredTop
              : Math.min(windowHeight - PICKER_HEIGHT - EDGE_PADDING, y + height + PICKER_GAP);
          const centeredLeft = x + width / 2 - pickerWidth / 2;
          const left = Math.min(
            windowWidth - pickerWidth - EDGE_PADDING,
            Math.max(EDGE_PADDING, centeredLeft)
          );

          setPosition({ left, top, width: pickerWidth });
          startEntranceAnimation();
        });
      });
    } else if (renderedRef.current) {
      containerOpacity.stopAnimation();
      containerScale.stopAnimation();
      containerTranslateY.stopAnimation();
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 0.9,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(containerTranslateY, {
          toValue: 7,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!visibleRef.current) {
          renderedRef.current = false;
          setRendered(false);
        }
      });
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    anchorRef,
    containerOpacity,
    containerScale,
    containerTranslateY,
    optionProgress,
    visible,
    windowHeight,
    windowWidth,
  ]);

  if (!rendered) return null;

  return (
    <Modal
      transparent
      visible={rendered}
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onDismiss}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close reaction picker"
        />

        {position && (
          <Animated.View
            style={[
              styles.picker,
              {
                left: position.left,
                top: position.top,
                width: position.width,
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.black,
                opacity: containerOpacity,
                transform: [
                  { translateY: containerTranslateY },
                  { scale: containerScale },
                ],
              },
            ]}
          >
            {REACTION_TYPES.map((type, index) => (
              <ReactionOption
                key={type}
                type={type}
                entranceProgress={optionProgress[index]}
                activeReaction={activeReaction}
                disabled={disabled}
                colors={colors}
                onSelect={onSelect}
              />
            ))}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  picker: {
    position: "absolute",
    height: PICKER_HEIGHT,
    borderRadius: PICKER_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    overflow: "visible",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 10,
  },
  optionEntrance: {
    width: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  optionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  optionEmoji: {
    fontSize: 25,
    lineHeight: 32,
  },
  tooltip: {
    position: "absolute",
    top: -34,
    zIndex: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 12,
  },
  tooltipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
});
