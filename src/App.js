import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./home/Home";
import Study from "./pages/Study/Study";
import Community from "./pages/Community/Community";
import Read from "./pages/Read/Read";
import Account from "./pages/Account/Account";
import Contact from "./pages/Contact/Contact";
import SignUp from "./pages/Account/signUp/SignUp";
import FindPw from "./pages/Account/findUser/FindPw";
import CreateCommunity from "./pages/Community/createCommunity/CreateCommunity";
import BrowseCommunity from "./pages/Community/browseCommunity/BrowseCommunity";
import CommunityWalkthrough from "./pages/Community/CommunityWalkthrough";
import Notifications from "./pages/Account/userMenu/Notifications";
import Profile from "./pages/Account/userMenu/Profile";
import CommunityInfo from "./pages/Community/browseCommunity/CommunityInfo";
import PostDetail from "./pages/Community/myCommunity/PostDetail";

import { AuthProvider } from "./component/context/AuthContext";
import { NotificationProvider } from "./component/context/NotificationContext";
import { ToastProvider } from "./component/context/ToastContext";
import MyCommunity from "./pages/Community/myCommunity/MyCommunity";
import SessionListener from "./component/utils/SessionListener";
import Notes from "./pages/Study/Notes/Notes";
import { NotesProvider } from "./component/context/NotesContext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <NotesProvider>
            <SessionListener />
            <NotificationProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/" exact element={<Home />} />
                  <Route path="/study" exact element={<Study />} />
                  <Route path="/community" exact element={<Community />} />
                  <Route path="/contact" exact element={<Contact />} />
                  <Route path="/account" exact element={<Account />} />
                  <Route path="/read" exact element={<Read />} />
                  <Route path="/signup" exact element={<SignUp />} />
                  <Route path="/findpw" exact element={<FindPw />} />
                  <Route path="/create-community" exact element={<CreateCommunity />} />
                  <Route path="/browse-community" exact element={<BrowseCommunity />} />
                  <Route path="/community-how" exact element={<CommunityWalkthrough />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/community/:communityId/info" element={<CommunityInfo />} />
                  <Route path="/community/:communityId/my-posts" element={<MyCommunity />} />
                  <Route path="/community/:communityId/posts/:postId" element={<PostDetail />} />
                  <Route path="/study/notes" element={<Notes />} />
                </Routes>
              </ToastProvider>
            </NotificationProvider>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </div >
  );
}

export default App;
