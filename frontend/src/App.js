import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { 
  Header, 
  HeroSection, 
  StatsSection, 
  BusinessSection, 
  ServicesSection, 
  CTASection, 
  Footer 
} from './components';

const Home = () => {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <BusinessSection />
      <ServicesSection />
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