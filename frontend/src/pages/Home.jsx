import { useEffect, useState } from "react";
import { fetchVideos } from "../utils/api";
import VideoCard from "../components/VideoCard";

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const getVideos = async () => {
      try {
        const data = await fetchVideos();
        setVideos(data);
      } catch (err) {
        console.error(err);
      }
    };
    getVideos();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

export default Home;
