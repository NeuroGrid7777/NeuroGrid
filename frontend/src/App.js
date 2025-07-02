import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { 
  Header, 
  HeroSection, 
  NeuralStatsSection, 
  IntelligenceModules, 
  NeuralLabsSection, 
  CTASection, 
  Footer 
} from './components';

const Home = () => {
  return (
    <div className="bg-deep-space min-h-screen">
      <Header />
      <HeroSection />
      <NeuralStatsSection />
      <IntelligenceModules />
      <NeuralLabsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;