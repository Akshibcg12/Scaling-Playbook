import playbookPdf from "@/assets/scaling-playbook.pdf.asset.json";

export async function downloadPlaybookPdf(
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  onProgress?.(0, 1);
  const res = await fetch(playbookPdf.url);
  if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
  const blob = await res.blob();
  onProgress?.(1, 1);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Scaling-Playbook.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
