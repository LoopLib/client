// avatar.js
import React from "react";
import { Avatar } from "@mui/material";

const AvatarComponent = ({ publisherName, profilePicture }) => {
  return (
    <Avatar
      alt={publisherName}
      src={profilePicture || "/default-avatar.png"}
      sx={{
        position: "absolute",
        top: 15,
        right: 15,
        width: 55,
        height: 55,
        border: "3px solid",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
      }}
    />
  );
};

export default AvatarComponent;
