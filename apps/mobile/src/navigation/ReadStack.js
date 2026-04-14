import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PassageReaderScreen from "../screens/PassageReaderScreen";

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

const ReadStack = ({
  user,
  notes,
  onRefresh,
  loading,
  bibleApi,
  notesApi,
  defaultVersionId,
}) => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ReadHome" options={{ headerShown: false }}>
        {({ navigation }) => (
          <HomeScreen
            user={user}
            notes={notes}
            onRefresh={onRefresh}
            loading={loading}
            navigation={navigation}
            bibleApi={bibleApi}
            defaultVersionId={defaultVersionId}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="PassageReader"
        options={({ route }) => ({
          title: route?.params?.reading?.reference || "Reading",
        })}
      >
        {(props) => (
          <PassageReaderScreen
            {...props}
            bibleApi={bibleApi}
            notesApi={notesApi}
            onRefreshNotes={onRefresh}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default ReadStack;
