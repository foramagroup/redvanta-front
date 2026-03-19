const saveAndDownload = async () => {
  const front = frontCanvas.toDataURL({ format: "png" });
  const back = backCanvas.toDataURL({ format: "png" });

  const res = await api.post("/customization/save", {
    front,
    back
  });

  const orderId = res.data.orderId;

  window.location.href =
    `${process.env.NEXT_PUBLIC_API_URL}/customization/download/${orderId}`;
};
