import GuideImage from "../../../../components/GuideImage.jsx";
import guidesData from "../../../../data/guides.json";

export default function ResourceCost() {
  const guideData = guidesData.squad.equipment.resourceCost;

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
