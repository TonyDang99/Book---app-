import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ARTWORK_SIZE = 40;
const STATIC_PROGRESS = new Animated.Value(0);

const FaceHighlight = () => <View pointerEvents="none" style={styles.faceHighlight} />;

const LikeReaction = ({ progress }) => (
  <View style={[styles.artboard, styles.likeBubble]}>
    <FaceHighlight />
    <Animated.View
      style={{
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
      }}
    >
      <Ionicons name="thumbs-up" size={25} color="#FFFFFF" />
    </Animated.View>
  </View>
);

const LoveReaction = ({ progress }) => (
  <View style={styles.artboard}>
    <Animated.View
      style={{
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
      }}
    >
      <View style={styles.loveShadow}>
        <Ionicons name="heart" size={39} color="#C7253F" />
      </View>
      <Ionicons name="heart" size={39} color="#F33E58" />
      <View style={styles.heartHighlight} />
    </Animated.View>
  </View>
);

const CareReaction = ({ progress }) => (
  <View style={styles.artboard}>
    <Animated.View
      style={[
        styles.careFace,
        {
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
        },
      ]}
    >
      <FaceHighlight />
      <View style={[styles.careEye, styles.careEyeLeft]} />
      <View style={[styles.careEye, styles.careEyeRight]} />
      <View style={styles.careSmile} />
    </Animated.View>

    <Animated.View
      style={[
        styles.careArm,
        styles.careArmLeft,
        {
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [-1.5, 1.5, -1.5],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: ["28deg", "8deg", "28deg"],
              }),
            },
          ],
        },
      ]}
    />
    <Animated.View
      style={[
        styles.careArm,
        styles.careArmRight,
        {
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [1.5, -1.5, 1.5],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: ["-28deg", "-8deg", "-28deg"],
              }),
            },
          ],
        },
      ]}
    />

    <Animated.View
      style={[
        styles.careHeart,
        {
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [0.88, 1.08, 0.88],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name="heart" size={19} color="#F33E58" />
    </Animated.View>
  </View>
);

const HahaReaction = ({ progress }) => (
  <Animated.View
    style={[
      styles.face,
      {
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
      },
    ]}
  >
    <FaceHighlight />
    <Animated.View
      style={[
        styles.hahaEye,
        styles.hahaEyeLeft,
        {
          transform: [
            { rotate: "18deg" },
            {
              scaleX: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [0.88, 1.12, 0.88],
              }),
            },
          ],
        },
      ]}
    />
    <Animated.View
      style={[
        styles.hahaEye,
        styles.hahaEyeRight,
        {
          transform: [
            { rotate: "-18deg" },
            {
              scaleX: progress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [0.88, 1.12, 0.88],
              }),
            },
          ],
        },
      ]}
    />
    <Animated.View
      style={[
        styles.hahaMouth,
        {
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
        },
      ]}
    >
      <View style={styles.hahaTeeth} />
      <View style={styles.hahaTongue} />
    </Animated.View>
  </Animated.View>
);

const WowReaction = ({ progress }) => {
  const blinkScale = progress.interpolate({
    inputRange: [0, 0.32, 0.39, 0.47, 1],
    outputRange: [1, 1, 0.16, 1, 1],
  });

  return (
    <Animated.View
      style={[
        styles.face,
        {
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 0.55, 1],
                outputRange: [0.98, 1.03, 0.98],
              }),
            },
          ],
        },
      ]}
    >
      <FaceHighlight />
      <Animated.View style={[styles.wowEye, styles.wowEyeLeft, { transform: [{ scaleY: blinkScale }] }]} />
      <Animated.View style={[styles.wowEye, styles.wowEyeRight, { transform: [{ scaleY: blinkScale }] }]} />
      <View style={[styles.wowBrow, styles.wowBrowLeft]} />
      <View style={[styles.wowBrow, styles.wowBrowRight]} />
      <Animated.View
        style={[
          styles.wowMouth,
          {
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
          },
        ]}
      />
    </Animated.View>
  );
};

const SadReaction = ({ progress }) => (
  <Animated.View
    style={[
      styles.face,
      {
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
      },
    ]}
  >
    <FaceHighlight />
    <View style={[styles.sadBrow, styles.sadBrowLeft]} />
    <View style={[styles.sadBrow, styles.sadBrowRight]} />
    <View style={[styles.sadEye, styles.sadEyeLeft]} />
    <View style={[styles.sadEye, styles.sadEyeRight]} />
    <View style={styles.sadMouth} />
    <Animated.View
      style={[
        styles.sadTear,
        {
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
        },
      ]}
    />
  </Animated.View>
);

const AngryReaction = ({ progress }) => (
  <Animated.View
    style={[
      styles.face,
      styles.angryFace,
      {
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
      },
    ]}
  >
    <View style={styles.angryGlow} />
    <View style={styles.angryHighlight} />
    <Animated.View
      style={[
        styles.angryBrow,
        styles.angryBrowLeft,
        {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [-1, 1, -1],
              }),
            },
            { rotate: "21deg" },
          ],
        },
      ]}
    />
    <Animated.View
      style={[
        styles.angryBrow,
        styles.angryBrowRight,
        {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [-1, 1, -1],
              }),
            },
            { rotate: "-21deg" },
          ],
        },
      ]}
    />
    <View style={[styles.angryEye, styles.angryEyeLeft]} />
    <View style={[styles.angryEye, styles.angryEyeRight]} />
    <Animated.View
      style={[
        styles.angryMouth,
        {
          transform: [
            {
              scaleX: progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.86, 1.08, 0.86],
              }),
            },
          ],
        },
      ]}
    />
  </Animated.View>
);

const REACTION_COMPONENTS = {
  like: LikeReaction,
  love: LoveReaction,
  care: CareReaction,
  haha: HahaReaction,
  wow: WowReaction,
  sad: SadReaction,
  angry: AngryReaction,
};

export default function ReactionArtwork({ type, progress = STATIC_PROGRESS, size = ARTWORK_SIZE }) {
  const Artwork = REACTION_COMPONENTS[type] || LikeReaction;
  const scale = size / ARTWORK_SIZE;

  return (
    <View
      accessible={false}
      pointerEvents="none"
      style={[styles.sizeFrame, { width: size, height: size }]}
    >
      <View style={[styles.artworkCanvas, { transform: [{ scale }] }]}>
        <Artwork progress={progress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
