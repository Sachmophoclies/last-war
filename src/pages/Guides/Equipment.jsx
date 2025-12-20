import GuideImage from "../../components/GuideImage.jsx";
import guidesData from "../../data/guides.json";

export default function Equipment() {
  const guideData = guidesData.equipment;

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
