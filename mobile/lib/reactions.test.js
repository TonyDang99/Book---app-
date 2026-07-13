import {
  buildOptimisticReaction,
  getReactionFromPoint,
  getReactionGestureState,
} from "./reactions";

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

describe("getReactionFromPoint", () => {
  const geometry = { left: 20, top: 100, width: 280, height: 58 };

  it.each([
    ["like", 40],
    ["love", 80],
    ["care", 120],
    ["haha", 160],
    ["wow", 200],
    ["sad", 240],
    ["angry", 280],
  ])("maps the %s hit zone while sliding", (reaction, pageX) => {
    expect(getReactionFromPoint(pageX, 125, geometry)).toBe(reaction);
  });

  it("allows the enlarged icon area above the picker", () => {
    expect(getReactionFromPoint(200, 70, geometry)).toBe("wow");
  });

  it("returns null in the release-to-cancel zone", () => {
    expect(getReactionFromPoint(200, 210, geometry)).toBeNull();
    expect(getReactionFromPoint(10, 125, geometry)).toBeNull();
  });

  it("does not select when a hold is released on the trigger without sliding", () => {
    expect(getReactionGestureState(160, 174, geometry)).toEqual({
      enteredPicker: false,
      reaction: null,
    });
  });

  it("keeps the enlarged icon selectable only after entering the picker", () => {
    const entered = getReactionGestureState(200, 125, geometry);
    expect(entered).toEqual({ enteredPicker: true, reaction: "wow" });
    expect(getReactionGestureState(200, 50, geometry, entered.enteredPicker)).toEqual({
      enteredPicker: true,
      reaction: "wow",
    });
    expect(getReactionGestureState(200, 174, geometry, entered.enteredPicker)).toEqual({
      enteredPicker: true,
      reaction: null,
    });
  });
});
