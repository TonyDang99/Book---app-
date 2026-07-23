import { StyleSheet } from "react-native";

// Reaction artwork
export const ARTWORK_SIZE = 40;

export const getLikeAnimationStyle = (progress) => ({
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [1.5, -1.5, 1.5],
      }),
    },
    {
      rotate: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: ["-7deg", "8deg", "-7deg"],
      }),
    },
    {
      scale: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [0.92, 1.08, 0.92],
      }),
    },
  ],
});

export const getLoveAnimationStyle = (progress) => ({
  transform: [
    {
      scale: progress.interpolate({
        inputRange: [0, 0.3, 0.52, 0.72, 1],
        outputRange: [0.9, 1.08, 0.96, 1.06, 0.9],
      }),
    },
    {
      rotate: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["-3deg", "3deg", "-3deg"],
      }),
    },
  ],
});

export const getCareFaceAnimationStyle = (progress) => ({
  transform: [
    {
      scaleY: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [1, 0.94, 1],
      }),
    },
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [0, 1, 0],
      }),
    },
  ],
});

export const getCareArmAnimationStyle = (progress, side) => {
  const direction = side === "left" ? 1 : -1;

  return {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 0.45, 1],
          outputRange: [-1.5 * direction, 1.5 * direction, -1.5 * direction],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 0.45, 1],
          outputRange:
            side === "left" ? ["28deg", "8deg", "28deg"] : ["-28deg", "-8deg", "-28deg"],
        }),
      },
    ],
  };
};

export const getCareHeartAnimationStyle = (progress) => ({
  transform: [
    {
      scale: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [0.88, 1.08, 0.88],
      }),
    },
  ],
});

export const getHahaFaceAnimationStyle = (progress) => ({
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.35, 0.62, 1],
        outputRange: [1, -2, 1.5, 1],
      }),
    },
    {
      rotate: progress.interpolate({
        inputRange: [0, 0.35, 0.62, 1],
        outputRange: ["-2deg", "3deg", "-3deg", "-2deg"],
      }),
    },
  ],
});

export const getHahaEyeAnimationStyle = (progress, rotation) => ({
  transform: [
    { rotate: rotation },
    {
      scaleX: progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [0.88, 1.12, 0.88],
      }),
    },
  ],
});

export const getHahaMouthAnimationStyle = (progress) => ({
  transform: [
    {
      scaleY: progress.interpolate({
        inputRange: [0, 0.42, 1],
        outputRange: [0.82, 1.14, 0.82],
      }),
    },
    {
      scaleX: progress.interpolate({
        inputRange: [0, 0.42, 1],
        outputRange: [0.94, 1.05, 0.94],
      }),
    },
  ],
});

export const getWowFaceAnimationStyle = (progress) => ({
  transform: [
    {
      scale: progress.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: [0.98, 1.03, 0.98],
      }),
    },
  ],
});

export const getBlinkAnimationStyle = (blinkScale) => ({
  transform: [{ scaleY: blinkScale }],
});

export const getWowMouthAnimationStyle = (progress) => ({
  transform: [
    {
      scaleY: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.82, 1.16, 0.82],
      }),
    },
    {
      scaleX: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.92, 1.06, 0.92],
      }),
    },
  ],
});

export const getSadFaceAnimationStyle = (progress) => ({
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [-0.5, 1, -0.5],
      }),
    },
    {
      rotate: progress.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: ["1deg", "-2deg", "1deg"],
      }),
    },
  ],
});

export const getSadTearAnimationStyle = (progress) => ({
  opacity: progress.interpolate({
    inputRange: [0, 0.12, 0.3, 0.78, 1],
    outputRange: [0, 0, 1, 1, 0],
  }),
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.15, 1],
        outputRange: [-4, -4, 9],
      }),
    },
    { rotate: "38deg" },
    {
      scale: progress.interpolate({
        inputRange: [0, 0.35, 1],
        outputRange: [0.7, 1, 0.86],
      }),
    },
  ],
});

export const getAngryFaceAnimationStyle = (progress) => ({
  transform: [
    {
      rotate: progress.interpolate({
        inputRange: [0, 0.28, 0.55, 0.78, 1],
        outputRange: ["0deg", "-3deg", "3deg", "-2deg", "0deg"],
      }),
    },
    {
      scale: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.98, 1.03, 0.98],
      }),
    },
  ],
});

export const getAngryBrowAnimationStyle = (progress, rotation) => ({
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-1, 1, -1],
      }),
    },
    { rotate: rotation },
  ],
});

export const getAngryMouthAnimationStyle = (progress) => ({
  transform: [
    {
      scaleX: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.86, 1.08, 0.86],
      }),
    },
  ],
});

export const getArtworkFrameStyle = (size) => ({
  width: size,
  height: size,
});

export const getArtworkCanvasStyle = (scale) => ({
  transform: [{ scale }],
});

export const reactionArtworkStyles = StyleSheet.create({
  sizeFrame: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  artworkCanvas: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  artboard: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  face: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: ARTWORK_SIZE / 2,
    backgroundColor: "#FFD45A",
    borderWidth: 1,
    borderColor: "#F4AD2F",
    overflow: "hidden",
    shadowColor: "#9A5A00",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.26,
    shadowRadius: 1.5,
    elevation: 2,
  },
  faceHighlight: {
    position: "absolute",
    top: 3,
    left: 7,
    width: 21,
    height: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    transform: [{ rotate: "-13deg" }],
  },
  likeBubble: {
    borderRadius: ARTWORK_SIZE / 2,
    backgroundColor: "#1877F2",
    borderWidth: 1,
    borderColor: "#1268DA",
    shadowColor: "#0B4FA8",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.28,
    shadowRadius: 1.5,
    elevation: 2,
  },
  loveShadow: {
    position: "absolute",
    top: 2,
    left: 0,
  },
  heartHighlight: {
    position: "absolute",
    top: 8,
    left: 9,
    width: 9,
    height: 4,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.42)",
    transform: [{ rotate: "-26deg" }],
  },
  careFace: {
    position: "absolute",
    top: 0,
    left: 3,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFD45A",
    borderWidth: 1,
    borderColor: "#F4AD2F",
    overflow: "hidden",
  },
  careEye: {
    position: "absolute",
    top: 12,
    width: 3.5,
    height: 4.5,
    borderRadius: 2,
    backgroundColor: "#593A22",
  },
  careEyeLeft: { left: 8 },
  careEyeRight: { right: 8 },
  careSmile: {
    position: "absolute",
    top: 19,
    left: 12,
    width: 9,
    height: 5,
    borderBottomWidth: 2,
    borderColor: "#7B4322",
    borderRadius: 6,
  },
  careArm: {
    position: "absolute",
    bottom: 4,
    width: 13,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#F8BD38",
    borderWidth: 1,
    borderColor: "#E7A323",
    zIndex: 4,
  },
  careArmLeft: { left: 4 },
  careArmRight: { right: 4 },
  careHeart: {
    position: "absolute",
    bottom: -1,
    left: 10.5,
    zIndex: 3,
  },
  hahaEye: {
    position: "absolute",
    top: 12,
    width: 9,
    height: 2.4,
    borderRadius: 2,
    backgroundColor: "#54331F",
  },
  hahaEyeLeft: { left: 6.5 },
  hahaEyeRight: { right: 6.5 },
  hahaMouth: {
    position: "absolute",
    top: 20,
    left: 9,
    width: 22,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#4B251A",
    overflow: "hidden",
  },
  hahaTeeth: {
    position: "absolute",
    top: 0,
    left: 4,
    width: 14,
    height: 4.5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  hahaTongue: {
    position: "absolute",
    bottom: -1,
    left: 5,
    width: 12,
    height: 6,
    borderRadius: 7,
    backgroundColor: "#E85C68",
  },
  wowEye: {
    position: "absolute",
    top: 12,
    width: 5.5,
    height: 7.5,
    borderRadius: 4,
    backgroundColor: "#4A2D1E",
  },
  wowEyeLeft: { left: 9 },
  wowEyeRight: { right: 9 },
  wowBrow: {
    position: "absolute",
    top: 7,
    width: 7,
    height: 1.8,
    borderRadius: 2,
    backgroundColor: "#7A4A28",
  },
  wowBrowLeft: { left: 8, transform: [{ rotate: "-8deg" }] },
  wowBrowRight: { right: 8, transform: [{ rotate: "8deg" }] },
  wowMouth: {
    position: "absolute",
    top: 23,
    left: 14.5,
    width: 11,
    height: 12.5,
    borderRadius: 7,
    backgroundColor: "#4B251A",
  },
  sadBrow: {
    position: "absolute",
    top: 9,
    width: 7.5,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#7A4A28",
  },
  sadBrowLeft: { left: 7, transform: [{ rotate: "-15deg" }] },
  sadBrowRight: { right: 7, transform: [{ rotate: "15deg" }] },
  sadEye: {
    position: "absolute",
    top: 15,
    width: 4,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#54331F",
  },
  sadEyeLeft: { left: 10 },
  sadEyeRight: { right: 10 },
  sadMouth: {
    position: "absolute",
    top: 26,
    left: 13,
    width: 14,
    height: 7,
    borderTopWidth: 2.2,
    borderColor: "#693A23",
    borderRadius: 9,
  },
  sadTear: {
    position: "absolute",
    top: 17,
    right: 5.5,
    width: 6,
    height: 9,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 2,
    backgroundColor: "#3D9DF2",
    borderWidth: 0.7,
    borderColor: "#2384D9",
  },
  angryFace: {
    backgroundColor: "#F45B45",
    borderColor: "#D74532",
    shadowColor: "#8B2218",
  },
  angryGlow: {
    position: "absolute",
    bottom: -2,
    left: -1,
    width: 40,
    height: 23,
    borderRadius: 20,
    backgroundColor: "rgba(238,125,38,0.76)",
  },
  angryHighlight: {
    position: "absolute",
    top: 3,
    left: 8,
    width: 20,
    height: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    transform: [{ rotate: "-10deg" }],
  },
  angryBrow: {
    position: "absolute",
    top: 11,
    width: 11,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#5A281E",
  },
  angryBrowLeft: { left: 6 },
  angryBrowRight: { right: 6 },
  angryEye: {
    position: "absolute",
    top: 18,
    width: 4.5,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#4B251A",
  },
  angryEyeLeft: { left: 11 },
  angryEyeRight: { right: 11 },
  angryMouth: {
    position: "absolute",
    top: 28,
    left: 13,
    width: 14,
    height: 7,
    borderTopWidth: 2.4,
    borderColor: "#58261D",
    borderRadius: 9,
  },
});

// Reaction picker
export const EDGE_PADDING = 12;
export const PICKER_HEIGHT = 52;
export const PICKER_GAP = 9;
export const EXPANDED_ICON_OVERFLOW = 80;

export const getIdleAnimationConfig = (type) => ({
  rotation:
    {
      like: "-2deg",
      love: "0deg",
      care: "4deg",
      haha: "-4deg",
      wow: "1deg",
      sad: "-2deg",
      angry: "-5deg",
    }[type] || "-2deg",
  lift: { care: -2.5, haha: -3.5, wow: -2, sad: -1.5, angry: -1 }[type] || -1.5,
  peakScale: { care: 1.06, haha: 1.1, wow: 1.11, sad: 1.04, angry: 1.06 }[type] || 1.035,
});

export const getOptionEntranceAnimationStyle = (entranceProgress, reflowX) => ({
  opacity: entranceProgress,
  transform: [
    {
      translateY: entranceProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
      }),
    },
    { translateX: reflowX },
    {
      scale: entranceProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.68, 1],
      }),
    },
  ],
});

export const getOptionWidthStyle = (width) => ({ width });

export const getTooltipAnimationStyle = (shadowColor, hoverProgress) => ({
  backgroundColor: "rgba(30, 30, 30, 0.9)",
  shadowColor,
  opacity: hoverProgress,
  transform: [
    {
      translateY: hoverProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [6, 0],
      }),
    },
    {
      scale: hoverProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
      }),
    },
  ],
});

export const getOptionHoverAnimationStyle = (hoverProgress) => ({
  transform: [
    {
      translateY: hoverProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -28],
      }),
    },
    {
      scale: hoverProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.2],
      }),
    },
  ],
});

export const getOptionIdleAnimationStyle = (
  restingProgress,
  idleProgress,
  idleLift,
  idleRotation,
  idlePeakScale
) => ({
  transform: [
    {
      scale: restingProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.85],
      }),
    },
    {
      translateY: idleProgress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, idleLift, 0],
      }),
    },
    {
      rotate: idleProgress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["0deg", idleRotation, "0deg"],
      }),
    },
    {
      scale: idleProgress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, idlePeakScale, 1],
      }),
    },
  ],
});

export const getActiveOptionStyle = (backgroundColor) => ({ backgroundColor });

export const getPickerAnimationStyle = (
  position,
  colors,
  containerOpacity,
  containerTranslateY,
  containerScale
) => ({
  left: position.left,
  top: position.top,
  width: position.width,
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  shadowColor: colors.black,
  opacity: containerOpacity,
  transform: [{ translateY: containerTranslateY }, { scale: containerScale }],
});

export const reactionPickerStyles = StyleSheet.create({
  providerRoot: {
    flex: 1,
    position: "relative",
    overflow: "visible",
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  picker: {
    position: "absolute",
    height: PICKER_HEIGHT,
    borderRadius: PICKER_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 7,
    overflow: "visible",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 16,
  },
  pickerHoverSurface: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    overflow: "visible",
  },
  optionEntrance: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  optionHighlighted: {
    zIndex: 20,
    elevation: 20,
  },
  optionWidth: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  optionButton: {
    width: 42,
    height: 42,
    cursor: "pointer",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    position: "absolute",
    top: -84,
    zIndex: 30,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 11,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 24,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
});

// Comment item dynamic styles
export const getOpacityStyle = (opacity) => ({ opacity });

export const getScaleStyle = (scale) => ({
  transform: [{ scale }],
});

export const getTextColorStyle = (color) => ({ color });

export const getReactionBadgeStyle = (colors, index) => ({
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  marginLeft: index > 0 ? -8 : 0,
  zIndex: 3 - index,
});
