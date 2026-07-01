import React from "react";
import { Sidebar } from "../components/sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Sidebar />
      <main className="flex-1">
        <div className="w-full mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
