import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const SelectionSheet = ({
  visible,
  title,
  subtitle,
  searchValue,
  onChangeSearch,
  searchPlaceholder,
  items,
  selectedValue,
  onSelect,
  onClose,
  keyExtractor,
  labelExtractor,
  detailExtractor,
  emptyMessage = "Nothing to show yet.",
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[85%] rounded-t-[32px] border border-line bg-cream px-5 pb-8 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-full bg-lineStrong" />
          </View>

          <View className="mb-4 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="font-display text-[26px] leading-[30px] text-ink">{title}</Text>
              {!!subtitle && (
                <Text className="mt-1 font-body text-[14px] leading-5 text-taupe">
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} className="rounded-full bg-sand px-4 py-2">
              <Text className="text-[13px] font-semibold text-ink">Close</Text>
            </Pressable>
          </View>

          {typeof onChangeSearch === "function" ? (
            <TextInput
              value={searchValue}
              onChangeText={onChangeSearch}
              placeholder={searchPlaceholder || "Search"}
              autoCapitalize="none"
              className="mb-4 rounded-2xl border border-lineStrong bg-white px-4 py-3 text-[15px] text-ink"
              placeholderTextColor="#8a7868"
            />
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-3 pb-4">
              {items.length ? (
                items.map((item) => {
                  const key = keyExtractor(item);
                  const label = labelExtractor(item);
                  const detail = typeof detailExtractor === "function" ? detailExtractor(item) : "";
                  const active = selectedValue === key;

                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSelect(item)}
                      className={`rounded-[22px] border px-4 py-4 ${
                        active ? "border-amber bg-sand" : "border-line bg-white/80"
                      }`}
                    >
                      <Text className="font-semibold text-[16px] text-ink">{label}</Text>
                      {!!detail && (
                        <Text className="mt-1 font-body text-[14px] leading-5 text-walnut">
                          {detail}
                        </Text>
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <View className="rounded-[22px] border border-dashed border-lineStrong bg-white/70 px-4 py-5">
                  <Text className="font-body text-[14px] leading-6 text-taupe">{emptyMessage}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SelectionSheet;
