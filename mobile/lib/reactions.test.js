import { buildOptimisticReaction } from "./reactions";

const emptyCounts = {
  like: 0,
  love: 0,
  care: 0,
  haha: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};

const makeComment = (overrides = {}) => ({
  _id: "comment-id",
  reactionCounts: { ...emptyCounts },
  userReaction: null,
  totalReactions: 0,
  topReactions: [],
  replies: [{ _id: "nested-reply" }],
  ...overrides,
});

describe("buildOptimisticReaction", () => {
  it("adds a reaction without changing nested replies", () => {
    const comment = makeComment();
    const updated = buildOptimisticReaction(comment, "love");

    expect(updated.userReaction).toBe("love");
    expect(updated.reactionCounts.love).toBe(1);
    expect(updated.totalReactions).toBe(1);
    expect(updated.topReactions).toEqual(["love"]);
    expect(updated.replies).toBe(comment.replies);
  });

  it("switches reaction type without changing the total", () => {
    const updated = buildOptimisticReaction(
      makeComment({
        reactionCounts: { ...emptyCounts, like: 2, love: 1 },
        userReaction: "like",
        totalReactions: 3,
        topReactions: ["like", "love"],
      }),
      "love"
    );

    expect(updated.userReaction).toBe("love");
    expect(updated.reactionCounts).toMatchObject({ like: 1, love: 2 });
    expect(updated.totalReactions).toBe(3);
    expect(updated.topReactions).toEqual(["love", "like"]);
  });

  it("removes the active reaction when the same type is selected", () => {
    const updated = buildOptimisticReaction(
      makeComment({
        reactionCounts: { ...emptyCounts, haha: 1 },
        userReaction: "haha",
        totalReactions: 1,
        topReactions: ["haha"],
      }),
      "haha"
    );

    expect(updated.userReaction).toBeNull();
    expect(updated.reactionCounts.haha).toBe(0);
    expect(updated.totalReactions).toBe(0);
    expect(updated.topReactions).toEqual([]);
  });

  it("uses the server's canonical type order to break count ties", () => {
    const updated = buildOptimisticReaction(
      makeComment({ reactionCounts: { ...emptyCounts, love: 1, wow: 1 }, totalReactions: 2 }),
      "like"
    );

    expect(updated.topReactions).toEqual(["like", "love", "wow"]);
  });
});
