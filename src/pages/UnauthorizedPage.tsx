import { Link } from "react-router-dom";
import {
  Home,
  LogIn,
  Lock,
  Users,
  ArrowLeft,
  AlertTriangle,
  Shield,
  HelpCircle,
} from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-r from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-600 p-6 text-center relative">
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          <div className="pt-12 p-6">
            <div className="flex justify-center mb-4">
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                403 ERROR
              </span>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Oops! Access Denied
            </h1>

            <p className="text-gray-600 text-center mb-6">
              You don't have permission to view this page. It's like trying to
              enter a private party without an invite!
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Private</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Lock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Restricted</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <HelpCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Help</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Try these:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Make sure you're logged in with the right account
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Ask the page admin for access permissions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Check if you need to upgrade your account
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full bbg-linear-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                <Home className="w-5 h-5" />
                <span>Back to Feed</span>
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200"
              >
                <LogIn className="w-5 h-5" />
                <span>Switch Account</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-full mt-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go back</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400">
                Need help? Reach out to our{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Support Community
                </a>
              </p>
              <p className="text-xs text-center text-gray-400 mt-1">
                or contact{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  @admin
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <span className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600 shadow-sm">
            #StaySafe
          </span>
          <span className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600 shadow-sm">
            #AccessDenied
          </span>
          <span className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600 shadow-sm">
            #AskForHelp
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
