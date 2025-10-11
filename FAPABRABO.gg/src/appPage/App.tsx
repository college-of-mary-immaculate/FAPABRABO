// ✅ App.tsx
import { Routes, Route } from "react-router-dom";
import GamegleHomepage from "../gamegleHomepage/GamegleHomepage";
import GamesPage from "./GamesPage";
import GamesPageTop from "../gamesPage/gamespage";
import PublisherDetail from "../gamesPage/gamePublisher";
import Footer from "../components/footer";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<GamegleHomepage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/TOPK" element={<GamesPageTop />} />
        <Route path="/gamesPage/:name" element={<PublisherDetail />} /> {/* ✅ NEW */}
      </Routes>
      <Footer />
    </>
  );
}
