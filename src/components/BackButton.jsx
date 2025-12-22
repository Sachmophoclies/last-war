import { useNavigate } from "react-router-dom";
import Footer from "./Footer.jsx";

export default function BackButton({ show = true, color = '#f59e0b' }) {
  const navigate = useNavigate();

  if (!show) return null;

  return <Footer onBack={() => navigate(-1)} backColor={color} />;
}
