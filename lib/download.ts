export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking right away can cancel the download in Safari and Firefox
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function downloadText(content: string, filename: string, mime = "text/plain") {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename)
}

export async function downloadDataUrl(dataUrl: string, filename: string) {
  const blob = await (await fetch(dataUrl)).blob()
  downloadBlob(blob, filename)
}
