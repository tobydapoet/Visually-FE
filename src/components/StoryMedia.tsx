import { type FC } from "react";
import { useStory } from "../contexts/story.context";

const StoryMedia: FC = () => {
  const { currentStory, isLoading, videoRef, setMediaWidth, setIsLoading } =
    useStory();

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {currentStory && isVideo(currentStory.mediaUrl) ? (
        <video
          ref={videoRef}
          key={currentStory.id}
          src={currentStory.mediaUrl}
          className="h-full w-full object-cover md:w-auto md:object-contain"
          muted
          playsInline
          autoPlay
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setMediaWidth(
              window.innerHeight * (video.videoWidth / video.videoHeight),
            );
          }}
          onCanPlay={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
        />
      ) : (
        <img
          key={currentStory?.id}
          src={currentStory?.mediaUrl}
          className="h-full w-full object-cover md:w-auto md:object-contain"
          onLoad={(e) => {
            setMediaWidth(e.currentTarget.getBoundingClientRect().width);
            setIsLoading(false);
          }}
          onLoadStart={() => setIsLoading(true)}
        />
      )}
    </>
  );
};

export default StoryMedia;
