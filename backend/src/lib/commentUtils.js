export const REACTION_TYPES = ["like", "love", "care", "haha", "wow", "sad", "angry"];

export const getReactionSummary = (reactions = [], userId) => {
  const reactionCounts = {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  let userReaction = null;

  for (const reaction of reactions) {
    if (REACTION_TYPES.includes(reaction.type)) {
      reactionCounts[reaction.type]++;
    }

    const reactionUserId = reaction.user?._id?.toString() || reaction.user?.toString();
    if (userId && reactionUserId === userId.toString()) {
      userReaction = reaction.type;
    }
  }

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  const topReactions = REACTION_TYPES.filter((type) => reactionCounts[type] > 0).sort(
    (a, b) => reactionCounts[b] - reactionCounts[a]
  );

  return { reactionCounts, userReaction, totalReactions, topReactions };
};

export const formatCommentResponse = (comment, userId) => {
  const commentObj = comment.toObject ? comment.toObject() : { ...comment };
  const summary = getReactionSummary(commentObj.reactions, userId);

  return {
    ...commentObj,
    ...summary,
  };
};

const getId = (value) => value?._id?.toString() || value?.toString();

export const buildCommentThreads = (comments, userId) => {
  const formattedComments = comments.map((comment) => ({
    ...formatCommentResponse(comment, userId),
    replies: [],
  }));
  const commentsById = new Map(
    formattedComments.map((comment) => [getId(comment._id), comment])
  );
  const topLevelComments = [];

  for (const comment of formattedComments) {
    const parentId = getId(comment.parentComment);
    const parentComment = parentId ? commentsById.get(parentId) : null;

    if (parentComment) {
      parentComment.replies.push(comment);
    } else {
      topLevelComments.push(comment);
    }
  }

  // The query is oldest first so replies read naturally; keep newest threads first.
  return topLevelComments.reverse();
};
