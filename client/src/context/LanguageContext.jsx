/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem("messmate-language") ||
      "en"
    );
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);

    localStorage.setItem(
      "messmate-language",
      newLanguage
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}