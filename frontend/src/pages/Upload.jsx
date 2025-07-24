import { useState } from "react";

function Upload() {
  const [title, setTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, channelName, thumbnailUrl }),
      });
      const data = await res.json();
      alert("Uploaded!");
      setTitle("");
      setChannelName("");
      setThumbnailUrl("");
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          className="w-full border px-4 py-2"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full border px-4 py-2"
          placeholder="Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
        />
        <input
          className="w-full border px-4 py-2"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>
    </div>
  );
}

export default Upload;
