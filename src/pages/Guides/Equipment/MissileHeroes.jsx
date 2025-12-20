import GuideImage from "../../../components/GuideImage.jsx";
import guidesData from "../../../data/guides.json";

export default function MissileHeroes() {
  const guideData = guidesData.equipment["missile-heroes"];

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
