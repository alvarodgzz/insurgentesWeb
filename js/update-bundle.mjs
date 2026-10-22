import { isDrivePath } from './drive-layout.mjs';

/** Update downloads contain content only, never scripts or authentication files. */
export function safeUpdatePath(value) {
  if (typeof value !== 'string') return false;
  if (['index.html', 'content/site.json', 'content/releases.json', 'content/lyrics.json'].includes(value)) return true;
  return /^content\/photos\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(value);
}

const crcTable = Uint32Array.from({length:256}, (_,index) => {
  let value = index;
  for (let bit=0; bit<8; bit++) value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
export function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Dependency-free ZIP, STORE method: JPEG/WebP images are already compressed. */
async function buildZip(files, allowedPath) {
  if (!Array.isArray(files) || !files.length || files.length > 65535) throw new Error('Selecciona archivos para la actualización.');
  const encoder = new TextEncoder(), seen = new Set(), chunks = [], directory = [];
  let offset = 0;
  for (const file of files) {
    if (!allowedPath(file.name) || seen.has(file.name)) throw new Error(`Ruta de actualización no válida o duplicada: ${file.name}`);
    seen.add(file.name);
    const name = encoder.encode(file.name);
    let data;
    if (typeof file.data === 'string') data = encoder.encode(file.data);
    else if (file.data instanceof Uint8Array) data = file.data;
    else if (file.data instanceof Blob) data = new Uint8Array(await file.data.arrayBuffer());
    else throw new Error(`Contenido de archivo no válido: ${file.name}`);
    if (data.byteLength > 0xFFFFFFFF || offset > 0xFFFFFFFF) throw new Error('La actualización es demasiado grande.');
    const checksum = crc32(data);
    const local = new Uint8Array(30 + name.length), localView = new DataView(local.buffer);
    localView.setUint32(0,0x04034b50,true); localView.setUint16(4,20,true); localView.setUint16(6,0x0800,true);
    localView.setUint16(12,0x5c21,true); localView.setUint32(14,checksum,true);
    localView.setUint32(18,data.length,true); localView.setUint32(22,data.length,true); localView.setUint16(26,name.length,true); local.set(name,30);
    chunks.push(local,data);
    const central = new Uint8Array(46 + name.length), centralView = new DataView(central.buffer);
    centralView.setUint32(0,0x02014b50,true); centralView.setUint16(4,20,true); centralView.setUint16(6,20,true); centralView.setUint16(8,0x0800,true);
    centralView.setUint16(14,0x5c21,true); centralView.setUint32(16,checksum,true); centralView.setUint32(20,data.length,true); centralView.setUint32(24,data.length,true); centralView.setUint16(28,name.length,true); centralView.setUint32(42,offset,true); central.set(name,46);
    directory.push(central);
    offset += local.length + data.length;
  }
  const directorySize = directory.reduce((sum,chunk) => sum + chunk.length,0);
  if (offset + directorySize > 0xFFFFFFFF) throw new Error('La actualización es demasiado grande.');
  const end = new Uint8Array(22), view = new DataView(end.buffer);
  view.setUint32(0,0x06054b50,true); view.setUint16(8,files.length,true); view.setUint16(10,files.length,true); view.setUint32(12,directorySize,true); view.setUint32(16,offset,true);
  return new Blob([...chunks,...directory,end],{type:'application/zip'});
}

export function createZip(files) { return buildZip(files, safeUpdatePath); }
export function createDriveZip(files) { return buildZip(files, isDrivePath); }
