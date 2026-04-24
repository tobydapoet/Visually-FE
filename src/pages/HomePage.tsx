import type React from "react";
import ValidUserStoryList from "../components/ValidUserStoryList";
import HomeFeed from "../components/HomeFeed";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent w-158 items-start">
      <ValidUserStoryList />
      <HomeFeed />
    </div>
  );
};

export default HomePage;
