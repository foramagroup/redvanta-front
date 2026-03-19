import api from "@/lib/api";

export default function useExport(canvasFront, canvasBack) {
  const exportPNG = async (dpi = 300) => {
    const imageBase64 = canvasFront.toDataURL({ format: "png" });

    const res = await api.post("/export/png", {
      imageBase64,
      dpi,
      filename: "design"
    });

    window.open(process.env.NEXT_PUBLIC_API_URL + res.data.url, "_blank");
  };

  const exportPDF = async () => {
    const front = canvasFront.toDataURL({ format: "png" });
    const back = canvasBack.toDataURL({ format: "png" });

    const res = await api.post("/export/pdf", {
      front,
      back,
      filename: "design"
    });

    window.open(process.env.NEXT_PUBLIC_API_URL + res.data.url, "_blank");
  };

  return { exportPNG, exportPDF };
}
