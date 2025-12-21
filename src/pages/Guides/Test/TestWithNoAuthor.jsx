import GuideImage from "../../../components/GuideImage.jsx";
import guidesData from "../../../data/guides.json";

export default function TestWithNoAuthor() {
  const guideData = guidesData.test.testWithNoAuthor;

  return (
    <GuideImage
      title={guideData.title}
      imageUrl={guideData.imageUrl}
      author={guideData.author}
      authorUrl={guideData.authorUrl}
    />
  );
}
