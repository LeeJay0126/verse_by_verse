import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotesListScreen from "../screens/NotesListScreen";
import NoteDetailScreen from "../screens/NoteDetailScreenClean";

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

const NotesStack = ({ notes, loading, error, onRefresh, notesApi }) => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="NotesList" options={{ headerShown: false }}>
        {(props) => (
          <NotesListScreen
            {...props}
            notes={notes}
            loading={loading}
            error={error}
            onRefresh={onRefresh}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="NoteDetail"
        options={({ route }) => ({
          title: route?.params?.note?.title || "Note",
        })}
      >
        {(props) => (
          <NoteDetailScreen
            {...props}
            notesApi={notesApi}
            onRefreshNotes={onRefresh}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default NotesStack;
