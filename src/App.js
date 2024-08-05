import React, { useState, useEffect } from "react";
import "./App.css";
import Papa from "papaparse";

function App() {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    industry: "",
    country: "",
    cnae: "",
  });

  const [options, setOptions] = useState({
    role: [],
    industry: [],
    country: [],
    cnae: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1Godd7j0mNfESSrv1pAH8IORMZccbgYI6tBbbOul4FZs/export?format=csv";

      const response = await fetch(sheetUrl);
      const csvText = await response.text();
      const results = Papa.parse(csvText, { header: true });
      const data = results.data;

      const roles = [...new Set(data.map((lead) => lead.Role))];
      const industries = [...new Set(data.map((lead) => lead.industry))];
      const countries = [...new Set(data.map((lead) => lead.country))];
      const cnaes = [...new Set(data.map((lead) => lead.CNAE))];

      setOptions({
        role: roles,
        industry: industries,
        country: countries,
        cnae: cnaes,
      });
    };

    fetchOptions();
  }, []);

  const handleFilterTypeChange = (e) => {
    setSelectedFilter(e.target.value);
    setFilters((prev) => ({
      ...prev,
      [e.target.value]: "",
    }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [selectedFilter]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1Godd7j0mNfESSrv1pAH8IORMZccbgYI6tBbbOul4FZs/export?format=csv";

    const response = await fetch(sheetUrl);
    const csvText = await response.text();
    const results = Papa.parse(csvText, { header: true });
    let filteredData = results.data;

    for (const [category, value] of Object.entries(filters)) {
      if (value) {
        filteredData = filteredData.filter((lead) => {
          const key = category.charAt(0).toUpperCase() + category.slice(1);
          return lead[key] === value;
        });
      }
    }

    if (filteredData.length === 0) {
      alert("No se encontraron datos que coincidan con los filtros aplicados.");
      return;
    }

    filteredData = filteredData.map((lead) => ({
      ...lead,
      DownloadCount: parseInt(lead.DownloadCount || 0, 10) + 1,
    }));

    const csv = Papa.unparse(filteredData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "filtered_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <h1>Filtrar Leads</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Tipo de Filtro:
            <select value={selectedFilter} onChange={handleFilterTypeChange}>
              <option value="">Seleccionar filtro</option>
              <option value="role">Role</option>
              <option value="industry">Industry</option>
              <option value="country">Country</option>
              <option value="cnae">CNAE</option>
            </select>
          </label>
        </div>
        {selectedFilter && (
          <div>
            <label>
              {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
              :
              <select
                value={filters[selectedFilter]}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {options[selectedFilter].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="BotonDescargar">
          <button type="submit">Aplicar Filtros y Descargar</button>
        </div>
      </form>
    </div>
  );
}

export default App;
