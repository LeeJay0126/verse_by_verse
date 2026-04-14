import React from "react";
import { View } from "react-native";

const tones = {
  default: "bg-cream border-line",
  soft: "bg-sand/80 border-line",
};

const SectionCard = ({ children, tone = "default" }) => {
  return (
    <View className={`gap-3 rounded-[24px] border px-5 py-5 ${tones[tone] || tones.default}`}>
      {children}
    </View>
  );
};

export default SectionCard;
