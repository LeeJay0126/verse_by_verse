import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CommunityBrowseScreen from "../screens/CommunityBrowseScreen";
import CommunityDetailScreen from "../screens/CommunityDetailScreen";
import MyCommunitiesScreen from "../screens/MyCommunitiesScreen";
import CommunityPostsScreen from "../screens/CommunityPostsScreen";
import CommunityPostDetailScreenClean from "../screens/CommunityPostDetailScreenClean";
import CommunityCreatePostScreen from "../screens/CommunityCreatePostScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: "#f6efe4",
  },
  headerTintColor: "#2d2018",
  headerTitleStyle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 20,
  },
  contentStyle: {
    backgroundColor: "#f6efe4",
  },
};

const CommunityStack = ({ communityApi, user }) => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CommunityHome" options={{ headerShown: false }}>
        {(props) => <CommunityBrowseScreen {...props} communityApi={communityApi} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CommunityDetail"
        options={({ route }) => ({
          title: route?.params?.community?.header || "Community",
        })}
      >
        {(props) => <CommunityDetailScreen {...props} communityApi={communityApi} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="MyCommunities" options={{ title: "My communities" }}>
        {(props) => <MyCommunitiesScreen {...props} communityApi={communityApi} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CommunityPosts"
        options={({ route }) => ({
          title: route?.params?.community?.header || "Community posts",
        })}
      >
        {(props) => <CommunityPostsScreen {...props} communityApi={communityApi} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CommunityCreatePost" options={{ title: "Create post" }}>
        {(props) => <CommunityCreatePostScreen {...props} communityApi={communityApi} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CommunityPostDetail"
        options={({ route }) => ({
          title: route?.params?.post?.title || "Post",
        })}
      >
        {(props) => (
          <CommunityPostDetailScreenClean {...props} communityApi={communityApi} user={user} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default CommunityStack;
