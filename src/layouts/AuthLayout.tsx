import { Outlet } from "react-router-dom";
import assets from "../assets";

export default function AuthLayout() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center ">
      <div className="flex w-full max-w-6xl h-screen md:h-auto overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gray-800 flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <div className="relative hidden w-1/2 bg-linear-to-br md:flex md:items-center md:justify-center">
          <img
            src={Math.random() < 0.5 ? assets.pic1 : assets.pic2}
            alt="social media app"
            className="h-full w-full object-cover drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
