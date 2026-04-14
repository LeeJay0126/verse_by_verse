import React from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";

const CommunityCard = ({
  title,
  subtitle,
  description,
  type,
  membersCount,
  lastActive,
  heroImageUrl,
  actionLabel = "Open",
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[26px] border border-line bg-cream shadow-soft"
    >
      {heroImageUrl ? (
        <ImageBackground
          source={{ uri: heroImageUrl }}
          className="min-h-[152px] justify-end bg-ink/70"
          imageStyle={{ opacity: 0.52 }}
        >
          <View className="bg-ink/75 px-5 py-5">
            <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-cream/80">
              {type || "Community"}
            </Text>
            <Text className="mt-2 font-display text-[26px] leading-[30px] text-cream">
              {title || "Untitled community"}
            </Text>
            {!!subtitle && (
              <Text className="mt-2 font-body text-[14px] leading-5 text-cream/85">
                {subtitle}
              </Text>
            )}
          </View>
        </ImageBackground>
      ) : (
        <View className="min-h-[152px] justify-end bg-ink px-5 py-5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-cream/80">
            {type || "Community"}
          </Text>
          <Text className="mt-2 font-display text-[26px] leading-[30px] text-cream">
            {title || "Untitled community"}
          </Text>
          {!!subtitle && (
            <Text className="mt-2 font-body text-[14px] leading-5 text-cream/85">{subtitle}</Text>
          )}
        </View>
      )}

      <View className="gap-4 px-5 py-5">
        <Text className="font-body text-[14px] leading-6 text-walnut" numberOfLines={3}>
          {description || "A place to read, reflect, and grow with others."}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-sand px-3 py-2">
            <Text className="text-[12px] font-bold text-ink">
              {membersCount || 0} member{membersCount === 1 ? "" : "s"}
            </Text>
          </View>
          <View className="rounded-full bg-sand px-3 py-2">
            <Text className="text-[12px] font-bold text-ink">
              {lastActive || "Recently active"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-end">
          <View className="rounded-full bg-ink px-4 py-3">
            <Text className="text-[13px] font-bold text-cream">{actionLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default CommunityCard;
