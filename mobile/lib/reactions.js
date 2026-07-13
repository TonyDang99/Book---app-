import { REACTION_TYPES } from "../constants/reactions";

export const REACTION_PICKER_TOP_HIT_SLOP = 52;
export const REACTION_PICKER_BOTTOM_HIT_SLOP = 0;
export const REACTION_PICKER_HORIZONTAL_PADDING = 7;

export const getReactionFromPoint = (
  pageX,
  pageY,
  geometry,
  { includeExpandedArea = true } = {}
) => {
  if (!geometry || !Number.isFinite(pageX) || !Number.isFinite(pageY)) return null;

  const { left, top, width, height } = geometry;
  const topHitSlop = includeExpandedArea ? REACTION_PICKER_TOP_HIT_SLOP : 0;
  const bottomHitSlop = includeExpandedArea ? REACTION_PICKER_BOTTOM_HIT_SLOP : 0;
  const withinX = pageX >= left && pageX <= left + width;
  const withinY =
    pageY >= top - topHitSlop && pageY <= top + height + bottomHitSlop;
  const interactiveWidth = width - REACTION_PICKER_HORIZONTAL_PADDING * 2;
  if (!withinX || !withinY || interactiveWidth <= 0) return null;

  const localX = Math.min(
    interactiveWidth - 0.0001,
    Math.max(0, pageX - left - REACTION_PICKER_HORIZONTAL_PADDING)
  );

  const index = Math.min(
    REACTION_TYPES.length - 1,
    Math.floor((localX / interactiveWidth) * REACTION_TYPES.length)
  );

  return REACTION_TYPES[index] || null;
};

export const getReactionGestureState = (
  pageX,
  pageY,
  geometry,
  hasEnteredPicker = false
) => {
  const reactionInsidePicker = getReactionFromPoint(pageX, pageY, geometry, {
    includeExpandedArea: false,
  });
  const enteredPicker = hasEnteredPicker || Boolean(reactionInsidePicker);

  return {
    enteredPicker,
    reaction: enteredPicker ? getReactionFromPoint(pageX, pageY, geometry) : null,
  };
};

export const buildOptimisticReaction = (comment, selectedType) => {
  const previousType = comment.userReaction;
  const reactionCounts = Object.fromEntries(
    REACTION_TYPES.map((type) => [type, Math.max(0, comment.reactionCounts?.[type] || 0)])
  );

  let userReaction = selectedType;
  if (previousType === selectedType) {
    reactionCounts[selectedType] = Math.max(0, reactionCounts[selectedType] - 1);
    userReaction = null;
  } else {
    if (previousType && reactionCounts[previousType] > 0) {
      reactionCounts[previousType] -= 1;
    }
    reactionCounts[selectedType] += 1;
  }

  const totalReactions = Object.values(reactionCounts).reduce((total, count) => total + count, 0);
  const topReactions = REACTION_TYPES.filter((type) => reactionCounts[type] > 0).sort(
    (first, second) =>
      reactionCounts[second] - reactionCounts[first] ||
      REACTION_TYPES.indexOf(first) - REACTION_TYPES.indexOf(second)
  );

  return {
    ...comment,
    reactionCounts,
    userReaction,
    totalReactions,
    topReactions,
  };
};
