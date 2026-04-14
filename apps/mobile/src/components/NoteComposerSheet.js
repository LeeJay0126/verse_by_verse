import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const NoteComposerSheet = ({
  visible,
  title,
  reference,
  body,
  onChangeTitle,
  onChangeBody,
  onClose,
  onSubmit,
  submitting,
  error,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[32px] border border-line bg-cream px-5 pb-8 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-full bg-lineStrong" />
          </View>

          <View className="mb-4 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
                New note
              </Text>
              <Text className="mt-1 font-display text-[26px] leading-[30px] text-ink">
                {reference}
              </Text>
              {!!title && (
                <Text className="mt-1 font-body text-[14px] leading-5 text-taupe">
                  {title}
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} className="rounded-full bg-sand px-4 py-2">
              <Text className="text-[13px] font-semibold text-ink">Close</Text>
            </Pressable>
          </View>

          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder="Note title"
            className="mb-3 rounded-2xl border border-lineStrong bg-white px-4 py-3 text-[15px] text-ink"
            placeholderTextColor="#8a7868"
          />

          <TextInput
            value={body}
            onChangeText={onChangeBody}
            placeholder="Write what stood out, what you noticed, or how you want to respond."
            multiline
            textAlignVertical="top"
            className="min-h-[180px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
            placeholderTextColor="#8a7868"
          />

          {!!error && (
            <Text className="mt-3 font-body text-[14px] leading-5 text-danger">{error}</Text>
          )}

          <View className="mt-5 flex-row items-center justify-between gap-3">
            <Text className="flex-1 font-body text-[13px] leading-5 text-taupe">
              Save a reflection while the passage is still fresh, just like the web study flow.
            </Text>
            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              className={`rounded-full bg-ink px-5 py-3 ${submitting ? "opacity-70" : ""}`}
            >
              <View className="flex-row items-center gap-2">
                {submitting ? <ActivityIndicator size="small" color="#fffaf3" /> : null}
                <Text className="text-[14px] font-bold text-cream">
                  {submitting ? "Saving..." : "Save note"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NoteComposerSheet;
