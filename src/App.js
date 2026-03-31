import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./home/Home";
import Study from "./pages/Study/Study";
import Community from "./pages/Community/Community";
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
import PostDetail from "./pages/Community/myCommunity/postDetail/PostDetail";
import CheckEmail from "./pages/Account/email/CheckEmail";
import VerifyEmail from "./pages/Account/email/VerifyEmail";
import ResetPassword from "./pages/Account/findUser/ResetPassword";

import { AuthProvider } from "./component/context/AuthContext";
import { NotificationProvider } from "./component/context/NotificationContext";
import { ToastProvider } from "./component/context/ToastContext";
import MyCommunity from "./pages/Community/myCommunity/MyCommunity";
import SessionListener from "./component/utils/SessionListener";
import Notes from "./pages/Study/Notes/Notes";
import { NotesProvider } from "./component/context/NotesContext";
import BibleWalkthrough from "./pages/Study/BibleWalkthrough";
import NotesPage from "./pages/Study/Notes/NotesPage";
import NotePage from "./pages/Study/Notes/NotePage";
import CommunityOverview from "./pages/Community/myCommunity/CommunityOverview";
import MemberManage from "./pages/Community/myCommunity/MemberManage";

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
                  <Route path="/community/:communityId" element={<CommunityOverview />} />
                  <Route path="/study" exact element={<Study />} />
                  <Route path="/community" exact element={<Community />} />
                  <Route path="/contact" exact element={<Contact />} />
                  <Route path="/account" exact element={<Account />} />
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
                  <Route path="/bible/walkthrough" element={<BibleWalkthrough />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:noteId" element={<NotePage />} />
                  <Route path="/check-email" element={<CheckEmail />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/community/:communityId/members/manage" element={<MemberManage />} />
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
