import GuideImage from "../../../../components/GuideImage.jsx";
import guidesData from "../../../../data/guides.json";

export default function HQ25_30() {
  const guideData = guidesData.buildings.hq["25-30"];

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
