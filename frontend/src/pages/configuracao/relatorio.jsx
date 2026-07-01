import React, { useState } from "react";

function Relatorio() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  return (
    <main className="flex-1 bg-white border rounded-lg p-8">
      <h1 className="text-3xl font-semibold mb-6">Relatório</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Período</h2>

        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm">Data inicial</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border rounded-lg p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          console.log("Data inicial:", dataInicio);
          console.log("Data final:", dataFim);
        }}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Gerar Relatório
      </button>
    </main>
  );
}

export default Relatorio;
