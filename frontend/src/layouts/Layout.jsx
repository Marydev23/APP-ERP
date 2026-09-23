import React from "react";
import { Sidebar } from "../components/sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <Sidebar />

      <main className="min-w-0 w-full md:ml-64">
        <div className="w-full max-w-[1400px] mx-auto p-3 pt-16 pb-16 md:p-5">
          {children}
        </div>
      </main>
    </div>
  );
}
