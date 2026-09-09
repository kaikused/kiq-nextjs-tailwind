export function nombreCompletoValido(nombre: string) {
  return nombre.trim().split(/\s+/).filter(Boolean).length >= 2;
}

export function telefonoValido(telefono: string) {
  return telefono.replace(/\D/g, '').length >= 9;
}
