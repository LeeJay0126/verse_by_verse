import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import SectionCard from "./SectionCard";

const AuthInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType,
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    secureTextEntry={secureTextEntry}
    autoCapitalize={autoCapitalize}
    keyboardType={keyboardType}
    className="rounded-2xl border border-lineStrong bg-white px-4 py-4 text-[16px] text-ink"
    placeholderTextColor="#8a7868"
  />
);

const AuthSectionCard = ({
  mode,
  onChangeMode,
  signIn,
  signUp,
  checkEmail,
  forgot,
  reset,
}) => {
  const tabs = [
    { id: "signIn", label: "Sign in" },
    { id: "signUp", label: "Create account" },
    { id: "forgot", label: "Forgot password" },
  ];
  if (reset?.enabled || mode === "reset") {
    tabs.push({ id: "reset", label: "Reset password" });
  }

  return (
    <SectionCard>
      <View className="mb-1 flex-row rounded-full bg-sand p-1">
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => onChangeMode(tab.id)}
            className={`flex-1 rounded-full px-3 py-3 ${
              mode === tab.id ? "bg-cream" : ""
            }`}
          >
            <Text className="text-center text-[13px] font-bold text-ink">{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === "signIn" && (
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Sign in
          </Text>
          <AuthInput
            value={signIn.identifier}
            onChangeText={signIn.onChangeIdentifier}
            placeholder="Username or email"
          />
          <AuthInput
            value={signIn.password}
            onChangeText={signIn.onChangePassword}
            placeholder="Password"
            secureTextEntry
          />
          {!!signIn.error && (
            <Text className="font-body text-[14px] leading-5 text-danger">{signIn.error}</Text>
          )}
          <Pressable
            onPress={signIn.onSubmit}
            disabled={signIn.submitting}
            className={`items-center rounded-2xl bg-ink px-4 py-4 ${
              signIn.submitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[16px] font-bold text-cream">
              {signIn.submitting ? "Signing in..." : "Sign in"}
            </Text>
          </Pressable>
        </View>
      )}

      {mode === "signUp" && (
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Create account
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <AuthInput
                value={signUp.firstName}
                onChangeText={signUp.onChangeFirstName}
                placeholder="First name"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <AuthInput
                value={signUp.lastName}
                onChangeText={signUp.onChangeLastName}
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>
          </View>
          <AuthInput
            value={signUp.email}
            onChangeText={signUp.onChangeEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
          <AuthInput
            value={signUp.username}
            onChangeText={signUp.onChangeUsername}
            placeholder="Username"
          />
          <AuthInput
            value={signUp.password}
            onChangeText={signUp.onChangePassword}
            placeholder="Password (min 10 chars)"
            secureTextEntry
          />
          <AuthInput
            value={signUp.confirmPassword}
            onChangeText={signUp.onChangeConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />
          {!!signUp.status && (
            <Text className="font-body text-[14px] leading-5 text-walnut">{signUp.status}</Text>
          )}
          {!!signUp.error && (
            <Text className="font-body text-[14px] leading-5 text-danger">{signUp.error}</Text>
          )}
          <Pressable
            onPress={signUp.onSubmit}
            disabled={signUp.submitting}
            className={`items-center rounded-2xl bg-ink px-4 py-4 ${
              signUp.submitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[16px] font-bold text-cream">
              {signUp.submitting ? "Creating..." : "Create account"}
            </Text>
          </Pressable>
        </View>
      )}

      {mode === "checkEmail" && (
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Check your email
          </Text>
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Verification email
            </Text>
            <Text className="mt-1 font-body text-[14px] leading-5 text-walnut">
              {checkEmail.email || "Awaiting account email"}
            </Text>
          </View>
          <Text className="font-body text-[14px] leading-6 text-walnut">
            Open the verification link we sent, then come back and sign in. If it does not show
            up right away, check spam or resend it below.
          </Text>
          {!!checkEmail.status && (
            <Text className="font-body text-[14px] leading-6 text-walnut">{checkEmail.status}</Text>
          )}
          {!!checkEmail.error && (
            <Text className="font-body text-[14px] leading-5 text-danger">{checkEmail.error}</Text>
          )}
          <Pressable
            onPress={checkEmail.onResend}
            disabled={checkEmail.submitting || !checkEmail.email}
            className={`items-center rounded-2xl bg-ink px-4 py-4 ${
              checkEmail.submitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[16px] font-bold text-cream">
              {checkEmail.submitting ? "Sending..." : "Resend verification email"}
            </Text>
          </Pressable>
          <Pressable
            onPress={checkEmail.onBackToSignIn}
            className="items-center rounded-2xl border border-lineStrong bg-white/70 px-4 py-4"
          >
            <Text className="text-[16px] font-bold text-ink">Back to sign in</Text>
          </Pressable>
        </View>
      )}

      {mode === "forgot" && (
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Reset password
          </Text>
          <AuthInput
            value={forgot.email}
            onChangeText={forgot.onChangeEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
          {!!forgot.status && (
            <Text className="font-body text-[14px] leading-6 text-walnut">{forgot.status}</Text>
          )}
          {!!forgot.error && (
            <Text className="font-body text-[14px] leading-5 text-danger">{forgot.error}</Text>
          )}
          <Pressable
            onPress={forgot.onSubmit}
            disabled={forgot.submitting}
            className={`items-center rounded-2xl bg-ink px-4 py-4 ${
              forgot.submitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[16px] font-bold text-cream">
              {forgot.submitting ? "Sending..." : "Send reset link"}
            </Text>
          </Pressable>
        </View>
      )}

      {mode === "reset" && (
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Reset password
          </Text>
          <View className="rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Reset email
            </Text>
            <Text className="mt-1 font-body text-[14px] leading-5 text-walnut">
              {reset.email || "Awaiting reset link"}
            </Text>
          </View>
          <AuthInput
            value={reset.newPassword}
            onChangeText={reset.onChangeNewPassword}
            placeholder="New password (min 10 chars)"
            secureTextEntry
          />
          <AuthInput
            value={reset.confirmPassword}
            onChangeText={reset.onChangeConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
          {!!reset.status && (
            <Text className="font-body text-[14px] leading-6 text-walnut">{reset.status}</Text>
          )}
          {!!reset.error && (
            <Text className="font-body text-[14px] leading-5 text-danger">{reset.error}</Text>
          )}
          <Pressable
            onPress={reset.onSubmit}
            disabled={reset.submitting}
            className={`items-center rounded-2xl bg-ink px-4 py-4 ${
              reset.submitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[16px] font-bold text-cream">
              {reset.submitting ? "Updating..." : "Update password"}
            </Text>
          </Pressable>
        </View>
      )}
    </SectionCard>
  );
};

export default AuthSectionCard;
