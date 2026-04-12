import { useNavigate } from "react-router-dom";

export const ParsedContent: React.FC<{
  caption: string;
  mentions?: { userId: string; username: string }[] | null;
  classname?: string;
}> = ({ caption, mentions = [], classname }) => {
  const navigate = useNavigate();

  const safeMentions = mentions ?? [];

  const parts = caption.split(/(@[a-zA-Z0-9_.]+)/g);
  return (
    <p className="text-white whitespace-pre-wrap">
      {parts.map((part, index) => {
        const mentionUsername = part.startsWith("@") ? part.slice(1) : null;
        const mention = safeMentions.find(
          (m) => m.username === mentionUsername,
        );

        if (mention) {
          return (
            <span
              key={index}
              onClick={() => navigate(`/${mention.username}`)}
              className={classname}
            >
              {part}
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};
