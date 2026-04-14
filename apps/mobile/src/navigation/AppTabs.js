import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ReadStack from "./ReadStack";
import NotesStack from "./NotesStack";
import CommunityStack from "./CommunityStack";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: "#2d2018",
  tabBarInactiveTintColor: "#7a6553",
  tabBarStyle: {
    height: 76,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#fffaf3",
    borderTopWidth: 1,
    borderTopColor: "rgba(127, 90, 54, 0.12)",
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontFamily: "PlayfairDisplay_600SemiBold",
  },
};

const AppTabs = ({
  user,
  notes,
  loading,
  error,
  bibleApi,
  communityApi,
  notesApi,
  defaultVersionId,
  onRefresh,
  onLogout,
  submitting,
}) => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Read"
        options={{
          tabBarLabel: "Read",
        }}
      >
        {() => (
          <ReadStack
            user={user}
            notes={notes}
            onRefresh={onRefresh}
            loading={loading}
            bibleApi={bibleApi}
            notesApi={notesApi}
            defaultVersionId={defaultVersionId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Notes"
        options={{
          tabBarLabel: "Notes",
        }}
      >
        {() => (
          <NotesStack
            notes={notes}
            loading={loading}
            error={error}
            onRefresh={onRefresh}
            notesApi={notesApi}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Community"
        options={{
          tabBarLabel: "Community",
        }}
      >
        {() => <CommunityStack communityApi={communityApi} user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
        }}
      >
        {() => <ProfileScreen user={user} onLogout={onLogout} submitting={submitting} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AppTabs;
