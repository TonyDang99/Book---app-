import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import ReactionArtwork from "./ReactionArtwork";
import { REACTION_LABEL, REACTION_TYPES } from "../constants/reactions";
import { getReactionGestureState } from "../lib/reactions";
import {
  reactionPickerStyles as styles,
  EDGE_PADDING,
  EXPANDED_ICON_OVERFLOW,
  PICKER_GAP,
  PICKER_HEIGHT,
  getActiveOptionStyle,
  getIdleAnimationConfig,
  getOptionEntranceAnimationStyle,
  getOptionHoverAnimationStyle,
  getOptionIdleAnimationStyle,
  getOptionWidthStyle,
  getPickerAnimationStyle,
  getTooltipAnimationStyle,
} from "../assets/styles/reactions.styles";

const EXIT_DURATION = 70;
const HOVER_DISMISS_DELAY = 180;

const ReactionPickerContext = createContext(null);

const playHaptic = (style) => {
  Haptics.impactAsync(style).catch(() => undefined);
};

const ReactionGlyph = ({ type, artworkProgress }) => (
  <ReactionArtwork type={type} progress={artworkProgress} />
);

function ReactionOption({
  type,
  index,
  entranceProgress,
  highlighted,
  highlightedIndex,
  hasHighlight,
  activeReaction,
  disabled,
  colors,
  baseWidth,
  pickerVisible,
  onHover,
  onSelect,
}) {
  const hoverProgress = useRef(new Animated.Value(0)).current;
  const restingProgress = useRef(new Animated.Value(0)).current;
  const reflowX = useRef(new Animated.Value(0)).current;
  const idleProgress = useRef(new Animated.Value(0)).current;
  const artworkProgress = useRef(new Animated.Value(0)).current;
  const distanceFromHighlight = highlightedIndex < 0 ? 0 : index - highlightedIndex;
  const reflowMagnitude =
    { 1: 12, 2: 8, 3: 4 }[Math.abs(distanceFromHighlight)] ||
    (distanceFromHighlight ? 2 : 0);
  const reflowOffset = Math.sign(distanceFromHighlight) * reflowMagnitude;

  useEffect(() => {
    hoverProgress.stopAnimation();
    Animated.timing(hoverProgress, {
      toValue: highlighted ? 1 : 0,
      duration: highlighted ? 190 : 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [highlighted, hoverProgress]);

  useEffect(() => {
    restingProgress.stopAnimation();
    Animated.timing(restingProgress, {
      toValue: hasHighlight && !highlighted ? 1 : 0,
      duration: 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [hasHighlight, highlighted, restingProgress]);

  useEffect(() => {
    reflowX.stopAnimation();
    Animated.timing(reflowX, {
      toValue: reflowOffset,
      duration: 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reflowOffset, reflowX]);

  useEffect(() => {
    idleProgress.stopAnimation();
    idleProgress.setValue(0);
    if (!pickerVisible || hasHighlight) return undefined;

    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 45),
        Animated.timing(idleProgress, {
          toValue: 1,
          duration: 430,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(idleProgress, {
          toValue: 0,
          duration: 430,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    idleAnimation.start();

    return () => idleAnimation.stop();
  }, [hasHighlight, idleProgress, index, pickerVisible]);

  useEffect(() => {
    artworkProgress.stopAnimation();
    artworkProgress.setValue(0);
    if (!pickerVisible) return undefined;

    const artworkAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 32),
        Animated.timing(artworkProgress, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(artworkProgress, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(90),
      ])
    );
    artworkAnimation.start();

    return () => artworkAnimation.stop();
  }, [artworkProgress, index, pickerVisible]);

  const handleSelect = () => {
    playHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(type);
  };

  const isActive = activeReaction === type;
  const {
    rotation: idleRotation,
    lift: idleLift,
    peakScale: idlePeakScale,
  } = getIdleAnimationConfig(type);
  return (
    <Animated.View
      style={[
        styles.optionEntrance,
        highlighted && styles.optionHighlighted,
        getOptionEntranceAnimationStyle(entranceProgress, reflowX),
      ]}
    >
      <Animated.View
        style={[
          styles.optionWidth,
          getOptionWidthStyle(baseWidth),
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tooltip,
            getTooltipAnimationStyle(colors.black, hoverProgress),
          ]}
        >
          <Text style={styles.tooltipText}>{REACTION_LABEL[type]}</Text>
        </Animated.View>

        <Animated.View style={getOptionHoverAnimationStyle(hoverProgress)}>
          <Animated.View
            style={getOptionIdleAnimationStyle(
              restingProgress,
              idleProgress,
              idleLift,
              idleRotation,
              idlePeakScale
            )}
          >
            <Pressable
              disabled={disabled}
              onPress={handleSelect}
              onPressIn={() => onHover(type)}
              onPressOut={() => onHover(null)}
              onHoverIn={() => onHover(type)}
              onHoverOut={() => onHover(null)}
              style={[
                styles.optionButton,
                isActive && getActiveOptionStyle(colors.inputBackground),
              ]}
              accessibilityRole="button"
              accessibilityLabel={REACTION_LABEL[type]}
              accessibilityState={{ selected: isActive, disabled }}
            >
              <ReactionGlyph type={type} artworkProgress={artworkProgress} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function ReactionPicker({
  visible,
  rootRef,
  anchorRef,
  activeReaction,
  hoveredReaction,
  colors,
  disabled = false,
  onGeometryChange,
  onHover,
  onHoverAreaEnter,
  onHoverAreaLeave,
  onSelect,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [rendered, setRendered] = useState(false);
  const [position, setPosition] = useState(null);
  const visibleRef = useRef(visible);
  const renderedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(0.92)).current;
  const containerTranslateY = useRef(new Animated.Value(6)).current;
  const optionProgress = useRef(new Animated.Value(0)).current;

  visibleRef.current = visible;

  useEffect(() => {
    const pickerWidth = Math.min(windowWidth - EDGE_PADDING * 2, 328);

    const startEntranceAnimation = () => {
      containerOpacity.stopAnimation();
      containerScale.stopAnimation();
      containerTranslateY.stopAnimation();
      optionProgress.stopAnimation();
      containerOpacity.setValue(0);
      containerScale.setValue(0.92);
      containerTranslateY.setValue(6);
      optionProgress.setValue(0);

      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 70,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 1,
          duration: 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(containerTranslateY, {
          toValue: 0,
          duration: 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(optionProgress, {
          toValue: 1,
          duration: 82,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (visible) {
      renderedRef.current = true;
      setRendered(true);
      setPosition(null);
      animationFrameRef.current = requestAnimationFrame(() => {
        const anchor = anchorRef?.current;
        const root = rootRef?.current;
        if (!anchor?.measureInWindow || !root?.measureInWindow) return;

        root.measureInWindow((rootX, rootY) => {
          anchor.measureInWindow((x, y, width, height) => {
            if (!visibleRef.current) return;

            const preferredTop = y - PICKER_HEIGHT - PICKER_GAP;
            const top =
              preferredTop >= EDGE_PADDING + EXPANDED_ICON_OVERFLOW
                ? preferredTop
                : Math.min(
                    windowHeight - PICKER_HEIGHT - EDGE_PADDING,
                    y + height + PICKER_GAP
                  );
            const centeredLeft = x + width / 2 - pickerWidth / 2;
            const left = Math.min(
              windowWidth - pickerWidth - EDGE_PADDING,
              Math.max(EDGE_PADDING, centeredLeft)
            );
            const geometry = { left, top, width: pickerWidth, height: PICKER_HEIGHT };

            setPosition({ left: left - rootX, top: top - rootY, width: pickerWidth });
            onGeometryChange(geometry);
            startEntranceAnimation();
          });
        });
      });
    } else if (renderedRef.current) {
      containerOpacity.stopAnimation();
      containerScale.stopAnimation();
      containerTranslateY.stopAnimation();
      optionProgress.stopAnimation();
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 0.4,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(containerTranslateY, {
          toValue: 58,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!visibleRef.current) {
          renderedRef.current = false;
          setRendered(false);
          setPosition(null);
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
    onGeometryChange,
    optionProgress,
    rootRef,
    visible,
    windowHeight,
    windowWidth,
  ]);

  if (!rendered) return null;

  const baseWidth = Math.min(
    46,
    Math.max(32, ((position?.width || 328) - 14) / REACTION_TYPES.length)
  );
  const highlightedIndex = REACTION_TYPES.indexOf(hoveredReaction);

  return (
    <View pointerEvents="box-none" style={styles.overlayRoot}>
      {position && (
        <Animated.View
          style={[
            styles.picker,
            getPickerAnimationStyle(
              position,
              colors,
              containerOpacity,
              containerTranslateY,
              containerScale
            ),
          ]}
        >
          <Pressable
            accessible={false}
            onHoverIn={onHoverAreaEnter}
            onHoverOut={onHoverAreaLeave}
            style={styles.pickerHoverSurface}
          >
            {REACTION_TYPES.map((type, index) => (
              <ReactionOption
                key={type}
                type={type}
                index={index}
                entranceProgress={optionProgress}
                highlighted={hoveredReaction === type}
                highlightedIndex={highlightedIndex}
                hasHighlight={Boolean(hoveredReaction)}
                activeReaction={activeReaction}
                disabled={disabled}
                colors={colors}
                baseWidth={baseWidth}
                pickerVisible={visible}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

export function ReactionPickerProvider({ children, colors }) {
  const rootRef = useRef(null);
  const targetRef = useRef(null);
  const geometryRef = useRef(null);
  const hoveredRef = useRef(null);
  const gestureEnteredPickerRef = useRef(false);
  const clearTargetTimerRef = useRef(null);
  const hoverDismissTimerRef = useRef(null);
  const [target, setTarget] = useState(null);
  const [visible, setVisible] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const setHover = useCallback((reaction, haptic = true) => {
    if (hoveredRef.current === reaction) return;
    hoveredRef.current = reaction;
    setHoveredReaction(reaction);
    if (reaction && haptic) Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const keepReactionPickerOpen = useCallback(() => {
    if (!hoverDismissTimerRef.current) return;
    clearTimeout(hoverDismissTimerRef.current);
    hoverDismissTimerRef.current = null;
  }, []);

  const dismissPicker = useCallback(() => {
    keepReactionPickerOpen();
    setVisible(false);
    setHover(null, false);
    geometryRef.current = null;
    gestureEnteredPickerRef.current = false;
    if (clearTargetTimerRef.current) clearTimeout(clearTargetTimerRef.current);
    clearTargetTimerRef.current = setTimeout(() => {
      targetRef.current = null;
      setTarget(null);
    }, EXIT_DURATION + 30);
  }, [keepReactionPickerOpen, setHover]);

  const scheduleReactionPickerDismiss = useCallback(() => {
    keepReactionPickerOpen();
    hoverDismissTimerRef.current = setTimeout(() => {
      hoverDismissTimerRef.current = null;
      dismissPicker();
    }, HOVER_DISMISS_DELAY);
  }, [dismissPicker, keepReactionPickerOpen]);

  const openReactionPicker = useCallback(
    (nextTarget) => {
      keepReactionPickerOpen();
      if (clearTargetTimerRef.current) clearTimeout(clearTargetTimerRef.current);
      targetRef.current = nextTarget;
      geometryRef.current = null;
      gestureEnteredPickerRef.current = false;
      setHover(null, false);
      setTarget(nextTarget);
      setVisible(true);
      Haptics.selectionAsync().catch(() => undefined);
    },
    [keepReactionPickerOpen, setHover]
  );

  const updateReactionGesture = useCallback(
    (pageX, pageY) => {
      const gestureState = getReactionGestureState(
        pageX,
        pageY,
        geometryRef.current,
        gestureEnteredPickerRef.current
      );
      gestureEnteredPickerRef.current = gestureState.enteredPicker;
      setHover(gestureState.reaction);
    },
    [setHover]
  );

  const finishReactionGesture = useCallback(
    (pageX, pageY) => {
      const { reaction } = getReactionGestureState(
        pageX,
        pageY,
        geometryRef.current,
        gestureEnteredPickerRef.current
      );
      const onSelect = targetRef.current?.onSelect;
      dismissPicker();
      if (reaction && onSelect) {
        playHaptic(Haptics.ImpactFeedbackStyle.Medium);
        onSelect(reaction);
      }
    },
    [dismissPicker]
  );

  const selectReaction = useCallback(
    (reaction) => {
      const onSelect = targetRef.current?.onSelect;
      dismissPicker();
      onSelect?.(reaction);
    },
    [dismissPicker]
  );

  const handleGeometryChange = useCallback((geometry) => {
    geometryRef.current = geometry;
  }, []);

  useEffect(
    () => () => {
      if (clearTargetTimerRef.current) clearTimeout(clearTargetTimerRef.current);
      if (hoverDismissTimerRef.current) clearTimeout(hoverDismissTimerRef.current);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      activeCommentId: visible ? target?.commentId : null,
      openReactionPicker,
      keepReactionPickerOpen,
      scheduleReactionPickerDismiss,
      updateReactionGesture,
      finishReactionGesture,
      cancelReactionGesture: dismissPicker,
    }),
    [
      dismissPicker,
      finishReactionGesture,
      keepReactionPickerOpen,
      openReactionPicker,
      scheduleReactionPickerDismiss,
      target?.commentId,
      updateReactionGesture,
      visible,
    ]
  );

  return (
    <ReactionPickerContext.Provider value={contextValue}>
      <View ref={rootRef} collapsable={false} style={styles.providerRoot}>
        {children}
        <ReactionPicker
          visible={visible}
          rootRef={rootRef}
          anchorRef={target?.anchorRef}
          activeReaction={target?.activeReaction}
          hoveredReaction={hoveredReaction}
          colors={colors}
          disabled={target?.disabled}
          onGeometryChange={handleGeometryChange}
          onHover={setHover}
          onHoverAreaEnter={keepReactionPickerOpen}
          onHoverAreaLeave={scheduleReactionPickerDismiss}
          onSelect={selectReaction}
        />
      </View>
    </ReactionPickerContext.Provider>
  );
}

export const useReactionPicker = () => {
  const context = useContext(ReactionPickerContext);
  if (!context) throw new Error("useReactionPicker must be used inside ReactionPickerProvider");
  return context;
};
