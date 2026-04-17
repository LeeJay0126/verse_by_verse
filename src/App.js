import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./home/Home";
import About from "./pages/About/About.js";
import AboutFeatureDetail from "./pages/About/AboutFeatureDetail";
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
import ExpiredVerifyEmail from "./pages/Account/email/ExpiredVerifyEmail";
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
import CommunityBibleStudyComposer from "./pages/Community/myCommunity/bibleStudyComposer/CommunityBibleStudyComposer";
import BibleStudyShare from "./pages/Community/myCommunity/postDetail/BibleStudyShare";
import RequireAuth from "./component/routes/RequireAuth";
import RequireCommunityAccess from "./component/routes/RequireCommunityAccess";
import MobileUnavailable, { useIsMobileViewport } from "./component/MobileUnavailable";

function App() {
  const isMobileViewport = useIsMobileViewport();

  if (isMobileViewport) {
    return <MobileUnavailable />;
  }

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
                  <Route path="/about" exact element={<About />} />
                  <Route path="/about/:featureSlug" exact element={<AboutFeatureDetail />} />
                  <Route path="/study" exact element={<Study />} />
                  <Route path="/community" exact element={<Community />} />
                  <Route path="/contact" exact element={<Contact />} />
                  <Route path="/account" exact element={<Account />} />
                  <Route path="/signup" exact element={<SignUp />} />
                  <Route path="/findpw" exact element={<FindPw />} />
                  <Route
                    path="/create-community"
                    exact
                    element={
                      <RequireAuth>
                        <CreateCommunity />
                      </RequireAuth>
                    }
                  />
                  <Route path="/browse-community" exact element={<BrowseCommunity />} />
                  <Route path="/community-how" exact element={<CommunityWalkthrough />} />
                  <Route
                    path="/notifications"
                    element={
                      <RequireAuth>
                        <Notifications />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <Profile />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/community/:communityId/info"
                    element={
                      <RequireAuth>
                        <CommunityInfo />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/community/:communityId"
                    element={
                      <RequireCommunityAccess>
                        <CommunityOverview />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route
                    path="/community/:communityId/my-posts"
                    element={
                      <RequireCommunityAccess>
                        <MyCommunity />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route
                    path="/community/:communityId/posts/:postId"
                    element={
                      <RequireCommunityAccess>
                        <PostDetail />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route
                    path="/community/:communityId/bible-study/new"
                    element={
                      <RequireCommunityAccess mode="bible-study">
                        <CommunityBibleStudyComposer />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route
                    path="/community/:communityId/bible-study/:postId/edit"
                    element={
                      <RequireCommunityAccess mode="bible-study">
                        <CommunityBibleStudyComposer />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route
                    path="/community/:communityId/posts/:postId/share"
                    element={
                      <RequireCommunityAccess>
                        <BibleStudyShare />
                      </RequireCommunityAccess>
                    }
                  />
                  <Route path="/study/notes" element={<Notes />} />
                  <Route path="/bible/walkthrough" element={<BibleWalkthrough />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:noteId" element={<NotePage />} />
                  <Route path="/check-email" element={<CheckEmail />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/verify-email-expired" element={<ExpiredVerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/community/:communityId/members/manage"
                    element={
                      <RequireCommunityAccess mode="manage-members">
                        <MemberManage />
                      </RequireCommunityAccess>
                    }
                  />
                </Routes>
              </ToastProvider>
            </NotificationProvider>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
