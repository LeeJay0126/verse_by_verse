import './App.css';
import Header from './component/Header';
import Home from "./home/Home";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header/>
      </header>
      <Home/>
    </div>
  );
}

export default App;
