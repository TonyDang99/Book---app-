import User from "../models/User.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const resolveFollowedMentions = async (text, followingIds = []) => {
  if (!text?.includes("@") || followingIds.length === 0) return [];

  const followedUsers = await User.find({ _id: { $in: followingIds } }).select(
    "username profileImage"
  );

  return followedUsers.filter((user) => {
    const mentionPattern = new RegExp(
      `(^|\\s)@${escapeRegExp(user.username)}(?=\\s|[.,!?;:]|$)`,
      "i"
    );
    return mentionPattern.test(text);
  });
};

export const notifyMentionedUsers = async ({
  mentionedUsers,
  excludedUserIds = [],
  actor,
  book,
  commentId,
  createNotification,
}) => {
  const excludedIds = new Set([
    actor._id.toString(),
    ...excludedUserIds.filter(Boolean).map((id) => id.toString()),
  ]);

  await Promise.all(
    mentionedUsers
      .filter((user) => !excludedIds.has(user._id.toString()))
      .map((user) =>
        createNotification({
          recipientId: user._id,
          actorId: actor._id,
          type: "mention",
          message: `${actor.username} mentioned you in a comment on “${book.title}”.`,
          bookId: book._id,
          commentId,
        })
      )
  );
};
