import Home from "./home/Home";
import About from "./pages/About/About";
import Study from "./pages/Study/Study";
import Community from "./pages/Community/Community";
import Read from "./pages/Read/Read";
import Account from "./pages/Account/Account";
import Contact from "./pages/Contact/Contact";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/about" exact element={<About />} />
          <Route path="/study" exact element={<Study />} />
          <Route path="/community" exact element={<Community />} />
          <Route path="/contact" exact element={<Contact />} />
          <Route path="/account" exact element={<Account />} />
          <Route path="/read" exact element={<Read />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
