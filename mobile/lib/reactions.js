import { REACTION_TYPES } from "../constants/reactions";

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
