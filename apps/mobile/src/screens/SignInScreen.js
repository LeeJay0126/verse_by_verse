import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import AuthSectionCard from "../components/AuthSectionCard";
import SectionCard from "../components/SectionCard";

const SignInScreen = ({
  mode,
  onChangeMode,
  initializing,
  submitting,
  authNotice,
  identifier,
  password,
  error,
  onChangeIdentifier,
  onChangePassword,
  onSubmit,
  signUpForm,
  onChangeSignUpField,
  onSubmitSignUp,
  signUpStatus,
  checkEmail,
  forgotEmail,
  onChangeForgotEmail,
  onSubmitForgotPassword,
  forgotStatus,
  resetForm,
  onChangeResetField,
  onSubmitResetPassword,
  resetStatus,
  apiBase,
  exampleApiUrl,
  envKeys,
  scriptureEnvKeys,
}) => {
  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Verse by Verse Mobile
        </Text>
        <Text className="mb-3 font-display text-[34px] leading-[40px] text-ink">
          Scripture first, quietly guided.
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          We are shaping the mobile experience around the same ideas that make strong Bible apps
          feel calm and approachable: quick entry, a reading-first home, and reflection close by.
        </Text>
      </View>

      <SectionCard>
        {initializing ? (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#8f6840" />
            <Text className="font-body text-[15px] leading-6 text-walnut">
              Checking current session...
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {!!authNotice && (
              <View className="rounded-[20px] border border-line bg-sand px-4 py-4">
                <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                  Check your email
                </Text>
                <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
                  {authNotice}
                </Text>
              </View>
            )}

            <AuthSectionCard
              mode={mode}
              onChangeMode={onChangeMode}
              signIn={{
                identifier,
                password,
                error,
                submitting,
                onChangeIdentifier,
                onChangePassword,
                onSubmit,
              }}
              signUp={{
                ...signUpForm,
                error: mode === "signUp" ? error : "",
                status: signUpStatus,
                submitting,
                onChangeFirstName: (value) => onChangeSignUpField("firstName", value),
                onChangeLastName: (value) => onChangeSignUpField("lastName", value),
                onChangeEmail: (value) => onChangeSignUpField("email", value),
                onChangeUsername: (value) => onChangeSignUpField("username", value),
                onChangePassword: (value) => onChangeSignUpField("password", value),
                onChangeConfirmPassword: (value) =>
                  onChangeSignUpField("confirmPassword", value),
                onSubmit: onSubmitSignUp,
              }}
              checkEmail={{
                ...checkEmail,
                error: mode === "checkEmail" ? error : "",
                submitting,
              }}
              forgot={{
                email: forgotEmail,
                error: mode === "forgot" ? error : "",
                status: forgotStatus,
                submitting,
                onChangeEmail: onChangeForgotEmail,
                onSubmit: onSubmitForgotPassword,
              }}
              reset={{
                enabled: !!resetForm?.email && !!resetForm?.token,
                email: resetForm?.email,
                newPassword: resetForm?.newPassword,
                confirmPassword: resetForm?.confirmPassword,
                error: mode === "reset" ? error : "",
                status: resetStatus,
                submitting,
                onChangeNewPassword: (value) => onChangeResetField("newPassword", value),
                onChangeConfirmPassword: (value) =>
                  onChangeResetField("confirmPassword", value),
                onSubmit: onSubmitResetPassword,
              }}
            />
          </View>
        )}
        <Text className="font-body text-[14px] leading-6 text-taupe">
          If you are testing on a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to your
          computer's LAN address, like `http://192.168.1.100:4000`, instead of plain localhost.
        </Text>
      </SectionCard>
      <SectionCard tone="soft">
        <Text className="font-display text-[22px] leading-[28px] text-ink">Connection</Text>
        <View className="gap-3">
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="mb-1 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Resolved API base
            </Text>
            <Text className="font-body text-[14px] leading-5 text-walnut">
              {apiBase || "Not set"}
            </Text>
          </View>
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="mb-1 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Example auth endpoint
            </Text>
            <Text className="font-body text-[14px] leading-5 text-walnut">{exampleApiUrl}</Text>
          </View>
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Supported env keys
            </Text>
            <View className="gap-2">
              {envKeys.map((key) => (
                <Text className="font-body text-[14px] leading-5 text-walnut" key={key}>
                  {key}
                </Text>
              ))}
            </View>
          </View>
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Scripture env keys
            </Text>
            <View className="gap-2">
              {scriptureEnvKeys.map((key) => (
                <Text className="font-body text-[14px] leading-5 text-walnut" key={key}>
                  {key}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </SectionCard>
    </ScrollView>
  );
};

export default SignInScreen;
