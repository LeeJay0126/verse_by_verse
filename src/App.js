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

import { AuthProvider } from "./component/context/AuthContext";
import { NotificationProvider } from "./component/context/NotificationContext";
import { ToastProvider } from "./component/context/ToastContext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
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
              </Routes>
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </div >
  );
}

export default App;
