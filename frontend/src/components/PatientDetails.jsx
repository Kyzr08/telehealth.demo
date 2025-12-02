import React, { useRef, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Download } from 'lucide-react';
import "../css/patientDetails.css";

export default function PatientDetails({ patient, onBack }) {
  const pdfRef = useRef();
  const [recetas, setRecetas] = useState([]);

  useEffect(() => {
    if (patient?.id_historial) {
      fetch(
        `http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php?id_historial=${patient.id_historial}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRecetas(data.data);
          } else {
            console.error("Error al cargar recetas médicas:", data.message);
          }
        })
        .catch((err) => console.error("Error en la solicitud de recetas médicas:", err));
    }
  }, [patient?.id_historial]);

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const style = document.createElement('style');
    style.innerHTML = `
      @font-face {
        font-family: 'Tinos';
        src: url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
      }
      .pdf-content {
        font-family: 'Tinos', serif;
      }
    `;
    element.classList.add('pdf-content');
    element.appendChild(style);

    const opt = {
      margin: 0.5,
      filename: `Historial_${patient.paciente || "Paciente"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="patient-container">
      <div className="patient-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} /> Volver
        </button>
        <button onClick={handleDownloadPDF} className="download-btn">
          <Download size={20} /> Descargar PDF
        </button>
      </div>

      <div className="patient-card" ref={pdfRef}>
        {/* ENCABEZADO */}
        <header className="header-section">
          <div className="header-left">
            <div>
              <h1 className="app-title">Telehealth+</h1>
              <p className="subtitle">Reporte de Historia Clínica</p>
            </div>
          </div>
          <div className="header-right">
            <p><strong>Fecha de generación:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {/* DATOS GENERALES */}
        <section className="section">
          <h2 className="section-title">Datos Generales</h2>
          <div className="section-grid">
            <div>
              <p><span className="bold">Paciente:</span> {patient.paciente}</p>
              <p><span className="bold">DNI:</span> {patient.dni || "No registrado"}</p>
              <p><span className="bold">Edad:</span> {patient.edad || "No registrada"}</p>
            </div>
            <div>
              <p><span className="bold">Médico:</span> {patient.medico}</p>
              <p><span className="bold">Especialidad:</span> {patient.especialidad || "No registrada"}</p>
              <p><span className="bold">Tipo de Consulta:</span> {patient.tipo_consulta}</p>
            </div>
          </div>
        </section>

        {/* DETALLES DE LA CITA */}
        <section className="section">
          <h2 className="section-title">Detalles de la Cita</h2>
          <div className="section-grid">
            <div>
              <p><span className="bold">Fecha Programada:</span> {patient.fecha_cita || "No registrada"}</p>
              <p><span className="bold">Fecha de Realización:</span> {patient.fecha_realizacion || "No registrada"}</p>
            </div>
            <div>
              <p><span className="bold">Estado:</span> {patient.estado}</p>
              <p><span className="bold">Fecha de Diagnóstico:</span> {patient.fecha_diagnostico || "No registrada"}</p>
            </div>
          </div>
        </section>

        {/* DIAGNÓSTICO */}
        <section className="section">
          <h2 className="section-title">Diagnóstico y Descripción</h2>
          <div className="section-block">
            <p><span className="bold">Motivo de Consulta:</span> {patient.motivo_consulta}</p>
            <p><span className="bold">Descripción del Cuadro:</span> {patient.descripcion_cuadro}</p>
            <p><span className="bold">Diagnóstico:</span> {patient.diagnostico}</p>
            <p><span className="bold">Tipo de Atención:</span> {patient.tipo_atencion}</p>
          </div>
        </section>

        {/* ANTECEDENTES */}
        <section className="section">
          <h2 className="section-title">Antecedentes Médicos</h2>
          <div className="section-grid">
            <div><span className="bold">Patológicos:</span> {patient.antecedentes_patologicos}</div>
            <div><span className="bold">No Patológicos:</span> {patient.antecedentes_no_patologicos}</div>
            <div><span className="bold">Perinatales:</span> {patient.antecedentes_perinatales}</div>
            <div><span className="bold">Gineco-Obstétricos:</span> {patient.antecedentes_gineco_obstetricos}</div>
          </div>
        </section>

        {/* RECOMENDACIONES */}
        <section className="section">
          <h2 className="section-title">Recomendaciones y Observaciones</h2>
          <p><span className="bold">Recomendaciones:</span> {patient.recomendaciones}</p>
          <p><span className="bold">Observación:</span> {patient.observaciones}</p>
        </section>

        {/* RECETAS */}
        <section className="section">
          <h2 className="section-title">Recetas Médicas</h2>
          {recetas.length > 0 ? (
            <table className="receta-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Dosis</th>
                  <th>Frecuencia</th>
                  <th>Duración</th>
                  <th>Indicaciones</th>
                </tr>
              </thead>
              <tbody>
                {recetas.map((receta) => (
                  <tr key={receta.id_receta}>
                    <td>{receta.medicamento}</td>
                    <td>{receta.dosis}</td>
                    <td>{receta.frecuencia}</td>
                    <td>{receta.duracion}</td>
                    <td>{receta.indicaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-recetas">No hay recetas médicas registradas.</p>
          )}
        </section>

        {/* PIE DE PÁGINA */}
        <footer className="footer-section">
          <p>Telehealth+ © {new Date().getFullYear()} — Confidencial y de uso médico</p>
        </footer>
      </div>
    </div>
  );
}
