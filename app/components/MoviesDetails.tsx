"use client"; // Ensure this runs client-side

import React, { useEffect, useState } from "react";
import Image from "next/image";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Fetching the API key from .env


// Movie/TV Show details component with dynamic route parameter
export default function VideoDetails({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<any>(null);  // State to hold movie or TV show details
  const [videos, setVideos] = useState<any[]>([]); // State to hold videos for movie/TV show
  const [isMovie, setIsMovie] = useState<boolean | null>(null);    // Flag to differentiate between movie and TV show
  const [loading, setLoading] = useState<boolean>(true); // Track loading state

  const videoId = params.id; // Get the video ID from params
  console.log('videoId:', videoId); // Debugging videoId

  // Fetch video (movie or TV show) details
  const getVideoDetails = async (id: string, isMovie: boolean) => {
    const endpoint = isMovie
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
      : `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`;

    try {
      console.log('Fetching details from:', endpoint); // Debugging API call
      const res = await fetch(endpoint);
      const data = await res.json();
      console.log('Video details data:', data); // Debugging response data
      setVideo(data);
    } catch (error) {
      console.error("Error fetching video details:", error);
    }
  };

  // Fetch videos (movie or TV show videos)
  const getVideoVideos = async (id: string, isMovie: boolean) => {
    const endpoint = isMovie
      ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
      : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${API_KEY}`;

    try {
      console.log('Fetching videos from:', endpoint); // Debugging API call
      const res = await fetch(endpoint);
      const data = await res.json();
      console.log('Video videos data:', data); // Debugging response data
      setVideos(data.results);
    } catch (error) {
      console.error("Error fetching video videos:", error);
    }
  };

  // Check if the videoId is for a movie or TV show
  const checkIfMovieOrTV = async () => {
    try {
      // Try fetching the movie details first
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${videoId}?api_key=${API_KEY}`
      );
      const movieData = await movieRes.json();
      console.log('Movie data:', movieData); // Debugging

      if (movieData.id) {
        setIsMovie(true);
        getVideoDetails(videoId, true);
        getVideoVideos(videoId, true);
        setLoading(false); // Stop loading after fetching data
        return;
      }

      // If it's not a movie, try fetching TV show details
      const tvRes = await fetch(
        `https://api.themoviedb.org/3/tv/${videoId}?api_key=${API_KEY}`
      );
      const tvData = await tvRes.json();
      console.log('TV data:', tvData); // Debugging

      if (tvData.id) {
        setIsMovie(false);
        getVideoDetails(videoId, false);
        getVideoVideos(videoId, false);
        setLoading(false); // Stop loading after fetching data
      } else {
        setLoading(false); // If no data found, stop loading
      }
    } catch (error) {
      console.error("Error determining if movie or TV show:", error);
      setLoading(false); // Stop loading even in case of error
    }
  };

  useEffect(() => {
    if (videoId) {
      checkIfMovieOrTV();  // Determine if the content is a movie or TV show
    }
  }, [videoId]);

  if (loading) return <p>Loading...</p>; // Show loading message while data is being fetched

  // Select the first video (or any specific type of video like "trailer")
  const selectedVideo = videos.find((video) => video.type === "Trailer") || videos[0];

  if (!selectedVideo) return <p>No video available</p>;

  return (
    <div className="movie-details-page p-10">
      <h1 className="text-4xl mb-6">{video.title || video.name}</h1>
      <div className="flex gap-10">
        <Image
          src={`https://image.tmdb.org/t/p/w500/${video.poster_path}`}
          height={700}
          width={400}
          className="rounded-md"
          alt={video.title || video.name}
        />
        <div>
          <h2 className="text-2xl mb-4">Overview</h2>
          <p className="mb-6">{video.overview}</p>
          <p>
            <strong>{isMovie ? "Release Date" : "First Air Date"}:</strong>{" "}
            {isMovie ? video.release_date : video.first_air_date}
          </p>
          <p>
            <strong>Rating:</strong> {video.vote_average}
          </p>
        </div>
      </div>

      {/* Display the selected video */}
      <div className="mt-10">
        <h2 className="text-2xl mb-4">Featured Video</h2>
        <div className="video-item">
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${selectedVideo.key}`}
            title={selectedVideo.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <p className="mt-2">{selectedVideo.name}</p>
        </div>
      </div>

      {/* Download Option (example with a placeholder link) */}
      <div className="mt-5">
        <h3 className="text-xl">Download Video</h3>
        <p>Click below to download the {isMovie ? "movie" : "TV show"} trailer:</p>
        <a
          href={`https://www.youtube.com/watch?v=${selectedVideo.key}`} // Placeholder download link (YouTube does not allow direct downloads)
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          Download Trailer (external link)
        </a>
      </div>
    </div>
  );
}
