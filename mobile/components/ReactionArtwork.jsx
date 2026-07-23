import { Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  reactionArtworkStyles as styles,
  ARTWORK_SIZE,
  getAngryBrowAnimationStyle,
  getAngryFaceAnimationStyle,
  getAngryMouthAnimationStyle,
  getArtworkCanvasStyle,
  getArtworkFrameStyle,
  getBlinkAnimationStyle,
  getCareArmAnimationStyle,
  getCareFaceAnimationStyle,
  getCareHeartAnimationStyle,
  getHahaEyeAnimationStyle,
  getHahaFaceAnimationStyle,
  getHahaMouthAnimationStyle,
  getLikeAnimationStyle,
  getLoveAnimationStyle,
  getSadFaceAnimationStyle,
  getSadTearAnimationStyle,
  getWowFaceAnimationStyle,
  getWowMouthAnimationStyle,
} from "../assets/styles/reactions.styles";

const STATIC_PROGRESS = new Animated.Value(0);

const FaceHighlight = () => <View pointerEvents="none" style={styles.faceHighlight} />;

const LikeReaction = ({ progress }) => (
  <View style={[styles.artboard, styles.likeBubble]}>
    <FaceHighlight />
    <Animated.View style={getLikeAnimationStyle(progress)}>
      <Ionicons name="thumbs-up" size={25} color="#FFFFFF" />
    </Animated.View>
  </View>
);

const LoveReaction = ({ progress }) => (
  <View style={styles.artboard}>
    <Animated.View style={getLoveAnimationStyle(progress)}>
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
    <Animated.View style={[styles.careFace, getCareFaceAnimationStyle(progress)]}>
      <FaceHighlight />
      <View style={[styles.careEye, styles.careEyeLeft]} />
      <View style={[styles.careEye, styles.careEyeRight]} />
      <View style={styles.careSmile} />
    </Animated.View>

    <Animated.View
      style={[
        styles.careArm,
        styles.careArmLeft,
        getCareArmAnimationStyle(progress, "left"),
      ]}
    />
    <Animated.View
      style={[
        styles.careArm,
        styles.careArmRight,
        getCareArmAnimationStyle(progress, "right"),
      ]}
    />

    <Animated.View style={[styles.careHeart, getCareHeartAnimationStyle(progress)]}>
      <Ionicons name="heart" size={19} color="#F33E58" />
    </Animated.View>
  </View>
);

const HahaReaction = ({ progress }) => (
  <Animated.View style={[styles.face, getHahaFaceAnimationStyle(progress)]}>
    <FaceHighlight />
    <Animated.View
      style={[
        styles.hahaEye,
        styles.hahaEyeLeft,
        getHahaEyeAnimationStyle(progress, "18deg"),
      ]}
    />
    <Animated.View
      style={[
        styles.hahaEye,
        styles.hahaEyeRight,
        getHahaEyeAnimationStyle(progress, "-18deg"),
      ]}
    />
    <Animated.View style={[styles.hahaMouth, getHahaMouthAnimationStyle(progress)]}>
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
    <Animated.View style={[styles.face, getWowFaceAnimationStyle(progress)]}>
      <FaceHighlight />
      <Animated.View
        style={[styles.wowEye, styles.wowEyeLeft, getBlinkAnimationStyle(blinkScale)]}
      />
      <Animated.View
        style={[styles.wowEye, styles.wowEyeRight, getBlinkAnimationStyle(blinkScale)]}
      />
      <View style={[styles.wowBrow, styles.wowBrowLeft]} />
      <View style={[styles.wowBrow, styles.wowBrowRight]} />
      <Animated.View style={[styles.wowMouth, getWowMouthAnimationStyle(progress)]} />
    </Animated.View>
  );
};

const SadReaction = ({ progress }) => (
  <Animated.View style={[styles.face, getSadFaceAnimationStyle(progress)]}>
    <FaceHighlight />
    <View style={[styles.sadBrow, styles.sadBrowLeft]} />
    <View style={[styles.sadBrow, styles.sadBrowRight]} />
    <View style={[styles.sadEye, styles.sadEyeLeft]} />
    <View style={[styles.sadEye, styles.sadEyeRight]} />
    <View style={styles.sadMouth} />
    <Animated.View style={[styles.sadTear, getSadTearAnimationStyle(progress)]} />
  </Animated.View>
);

const AngryReaction = ({ progress }) => (
  <Animated.View
    style={[styles.face, styles.angryFace, getAngryFaceAnimationStyle(progress)]}
  >
    <View style={styles.angryGlow} />
    <View style={styles.angryHighlight} />
    <Animated.View
      style={[
        styles.angryBrow,
        styles.angryBrowLeft,
        getAngryBrowAnimationStyle(progress, "21deg"),
      ]}
    />
    <Animated.View
      style={[
        styles.angryBrow,
        styles.angryBrowRight,
        getAngryBrowAnimationStyle(progress, "-21deg"),
      ]}
    />
    <View style={[styles.angryEye, styles.angryEyeLeft]} />
    <View style={[styles.angryEye, styles.angryEyeRight]} />
    <Animated.View style={[styles.angryMouth, getAngryMouthAnimationStyle(progress)]} />
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
      style={[styles.sizeFrame, getArtworkFrameStyle(size)]}
    >
      <View style={[styles.artworkCanvas, getArtworkCanvasStyle(scale)]}>
        <Artwork progress={progress} />
      </View>
    </View>
  );
}
