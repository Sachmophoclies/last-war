import GuideImage from "../../../../components/GuideImage.jsx";
import guidesData from "../../../../data/guides.json";

export default function LevelingGuide() {
  const guideData = guidesData.squad.equipment.levelingGuide;

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
