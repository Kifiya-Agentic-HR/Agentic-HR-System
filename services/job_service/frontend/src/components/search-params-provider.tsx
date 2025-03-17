"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext } from "react";

interface SearchParamsContextProps {
  search: string;
  type: string;
  skills: string;
}

const SearchParamsContext = createContext<SearchParamsContextProps>({
  search: "",
  type: "",
  skills: "",
});

export function useCustomSearchParams() {
  return useContext(SearchParamsContext);
}

export default function SearchParamsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const skills = searchParams.get("skills") || "";

  return (
    <SearchParamsContext.Provider value={{ search, type, skills }}>
      {children}
    </SearchParamsContext.Provider>
  );
}
