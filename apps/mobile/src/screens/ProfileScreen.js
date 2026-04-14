import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";

const ProfileScreen = ({ user, onLogout, submitting }) => {
  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Account
        </Text>
        <Text className="font-display text-[32px] leading-[38px] text-ink">
          Keep your reading life close.
        </Text>
      </View>

      <SectionCard>
        <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
          Signed in as
        </Text>
        <Text className="font-display text-[26px] leading-[32px] text-ink">
          {user?.firstName || user?.username || user?.email || "Authenticated user"}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          This confirms the mobile app is reading your current session through the shared auth
          layer we extracted from the web app.
        </Text>
        <View className="mt-2 gap-2 rounded-[20px] border border-line bg-white/70 px-4 py-4">
          <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
            Account details
          </Text>
          <Text className="font-body text-[14px] leading-5 text-walnut">
            Email: {user?.email || "Not available"}
          </Text>
          <Text className="font-body text-[14px] leading-5 text-walnut">
            Username: {user?.username || "Not available"}
          </Text>
        </View>
      </SectionCard>

      <SectionCard tone="soft">
        <Text className="font-display text-[22px] leading-[28px] text-ink">What comes next</Text>
        <View className="gap-3">
          <Text className="font-body text-[15px] leading-6 text-walnut">
            We now have the foundation for a fuller mobile experience: auth, notes, shared API
            access, and a dedicated app shell.
          </Text>
          <Text className="font-body text-[15px] leading-6 text-walnut">
            Next layers can include reading plans, passage views, community, and more polished
            onboarding.
          </Text>
        </View>
        <Pressable
          onPress={onLogout}
          disabled={submitting}
          className="mt-2 self-start rounded-full bg-ink px-5 py-3"
        >
          <Text className="text-[14px] font-bold text-cream">
            {submitting ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>
      </SectionCard>
    </ScrollView>
  );
};

export default ProfileScreen;
