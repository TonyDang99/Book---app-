import User from "../models/User.js";
import mongoose from "mongoose";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const resolveFollowedMentions = async ({
  text,
  mentionIds = [],
  followingIds = [],
  additionalAllowedIds = [],
}) => {
  const allowedIds = new Set(
    [...(followingIds || []), ...(additionalAllowedIds || [])]
      .filter(Boolean)
      .map((id) => id.toString())
  );
  const explicitIds = (Array.isArray(mentionIds) ? mentionIds : [])
    .filter((id) => mongoose.isValidObjectId(id) && allowedIds.has(id.toString()))
    .map((id) => id.toString());

  const allowedUsers = await User.find({ _id: { $in: [...allowedIds] } }).select(
    "username profileImage"
  );
  const explicitIdSet = new Set(explicitIds);

  return allowedUsers.filter((user) => {
    const visibleNamePattern = new RegExp(
      `(^|[^\\p{L}\\p{N}_.-])@?${escapeRegExp(user.username)}(?=$|[^\\p{L}\\p{N}_.-])`,
      "iu"
    );
    if (explicitIdSet.has(user._id.toString()) && visibleNamePattern.test(text || "")) return true;
    if (!text?.includes("@")) return false;

    // Keep older @username comments working after structured mentions are introduced.
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
