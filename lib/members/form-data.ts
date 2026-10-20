export function appendTextFields(formData: FormData, values: Record<string, string | undefined>) {
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, typeof value === "string" ? value : "");
  }
}
