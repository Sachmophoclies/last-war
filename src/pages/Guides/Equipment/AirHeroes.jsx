import GuideImage from "../../../components/GuideImage.jsx";
import guidesData from "../../../data/guides.json";

export default function AirHeroes() {
  const guideData = guidesData.equipment["air-heroes"];

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
