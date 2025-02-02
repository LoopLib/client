import React, { createContext, useContext, useState } from "react";

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <FileContext.Provider value={{ selectedFile, setSelectedFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => useContext(FileContext);
