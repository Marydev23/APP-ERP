import { CardContent } from "@/components/ui/card";
import React from "react";

export default function Usuario() {
  return (
    <main className="flex-1 bg-white border rounded-lg p-8">
      <h1 className="text-2xl font-semibold mb-6">Sua Conta</h1>

      <div className="space-y-5">
        <Input label="Digite seu nome" placeholder="Nome" />
        <Input label="Digite seu e-mail" placeholder="seuemail@gmail.com" />
        <Input label="Digite sua senha" placeholder="Sua senha" />
      </div>

      <CardContent className="mt-8">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-blue-700 transition"
          >
            Salvar
          </button>

          <button
            type="button"
            className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-gray-700 transition"
          >
            Editar
          </button>

          <button
            type="button"
            className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-red-700 transition"
          >
            Excluir
          </button>
        </div>
      </CardContent>
    </main>
  );
}

function Input({ label, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="block font-medium">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
