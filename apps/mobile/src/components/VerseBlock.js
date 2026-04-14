import React from "react";
import { Text, View } from "react-native";

const VerseBlock = ({ number, text, selected = false, badgeLabel = "" }) => {
  return (
    <View
      className={`rounded-[22px] border px-5 py-5 ${
        selected ? "border-amber bg-sand" : "border-line bg-white/70"
      }`}
    >
      <View className="mb-2 flex-row items-center justify-between gap-3">
        <Text className="text-[12px] font-bold uppercase tracking-[1.2px] text-amber">
          Verse {number}
        </Text>
        {!!badgeLabel && (
          <View className="rounded-full bg-ink px-3 py-1">
            <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-cream">
              {badgeLabel}
            </Text>
          </View>
        )}
      </View>
      <Text className="font-body text-[18px] leading-8 text-ink">{text}</Text>
    </View>
  );
};

export default VerseBlock;
