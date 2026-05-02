import { Box } from "@mui/material";
import assets from "../assets";

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#18181B",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          animation: "float 3s ease-in-out infinite",
          "@keyframes float": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
            "100%": { transform: "translateY(0px)" },
          },
        }}
      >
        <img
          src={assets.logo}
          alt="Visually Logo"
          style={{
            width: "120px",
            height: "auto",
            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "white",
              animation: `bounce 1.5s ease-in-out ${dot * 0.2}s infinite`,
              "@keyframes bounce": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                "50%": { transform: "scale(1.5)", opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingSpinner;
