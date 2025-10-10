// ✅ App.tsx
import { Routes, Route } from "react-router-dom";
import GamegleHomepage from "../gamegleHomepage/GamegleHomepage";
import GamesPage from "./GamesPage";
import Footer from "../components/footer";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<GamegleHomepage />} />
        <Route path="/games" element={<GamesPage />} />
      </Routes>
      <Footer />
    </>
  );
}
