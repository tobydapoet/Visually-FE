import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";

const UnauthorizedPage: React.FC = () => {
  const { onLogout } = useUser();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          access denied
        </div>

        <div className="text-6xl font-medium text-zinc-800 leading-none tracking-tighter mb-4">
          403
        </div>

        <h1 className="text-xl font-medium text-zinc-100 mb-2">Unauthorized</h1>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          You don't have permission to view this page.
        </p>

        <div className="border-t border-zinc-800 my-6" />

        <ul className="space-y-2 mb-6">
          {[
            "Make sure you're logged in with the right account",
            "Ask the admin for access permissions",
            "Check if your account needs an upgrade",
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-xs text-zinc-500">
              <span className="text-zinc-700">0{i + 1}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center justify-center w-full bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium py-2.5 px-4 rounded-lg transition-opacity"
          >
            Back to feed
          </Link>
          <div
            onClick={() => onLogout(() => navigate("/login"))}
            className="flex cursor-pointer items-center justify-center w-full bg-transparent hover:bg-zinc-800 text-zinc-400 text-sm py-2.5 px-4 rounded-lg border border-zinc-700 transition-colors"
          >
            Switch account
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-xs cursor-pointer text-zinc-600 hover:text-zinc-400 w-full pt-2 transition-colors"
          >
            ← go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
