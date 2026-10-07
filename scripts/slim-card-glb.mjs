// Rewrites the React Bits badge model without its 2.3 MB demo texture.
//
//   node scripts/slim-card-glb.mjs <in.glb> <out.glb>
//
// The page prints both faces of every badge on a canvas at runtime (badge-art.ts) and gives the
// card its own material, so the model's atlas (the React Bits logo and pattern) is never shown.
// Its image, texture and sampler are removed, with the material's reference to them, and the
// remaining buffer views are re-packed. (An embedded image would also be fetched from a blob: URL,
// which the site's CSP refuses.) Geometry, UVs and the metal material are untouched.
import { readFileSync, writeFileSync } from 'node:fs';

const [src, out] = process.argv.slice(2);
if (!src || !out) throw new Error('usage: node scripts/slim-card-glb.mjs <in.glb> <out.glb>');

const glb = readFileSync(src);
if (glb.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${src} is not a GLB`);
const jsonLength = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
const binStart = 20 + jsonLength + 8;

const dropped = new Set((json.images ?? []).map(image => image.bufferView));
for (const material of json.materials ?? []) {
  delete material.pbrMetallicRoughness?.baseColorTexture;
  delete material.normalTexture;
  delete material.occlusionTexture;
  delete material.emissiveTexture;
  delete material.pbrMetallicRoughness?.metallicRoughnessTexture;
}
delete json.images;
delete json.textures;
delete json.samplers;

const pad4 = n => (n + 3) & ~3;
const remap = new Map();
const views = [];
const chunks = [];
let offset = 0;
json.bufferViews.forEach((view, index) => {
  if (dropped.has(index)) return;
  const start = binStart + (view.byteOffset ?? 0);
  const data = glb.subarray(start, start + view.byteLength);
  remap.set(index, views.length);
  views.push({ ...view, byteOffset: offset, byteLength: data.length });
  chunks.push(data, Buffer.alloc(pad4(data.length) - data.length));
  offset = pad4(offset + data.length);
});
json.bufferViews = views;
for (const accessor of json.accessors ?? []) {
  if (accessor.bufferView !== undefined) accessor.bufferView = remap.get(accessor.bufferView);
}
json.buffers = [{ byteLength: offset }];

const bin = Buffer.concat(chunks);
const jsonText = Buffer.from(JSON.stringify(json), 'utf8');
const jsonChunk = Buffer.concat([jsonText, Buffer.alloc(pad4(jsonText.length) - jsonText.length, 0x20)]);
const total = 12 + 8 + jsonChunk.length + 8 + bin.length;
const header = Buffer.alloc(12);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
const chunkHeader = (length, type) => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(length, 0);
  h.write(type, 4, 'ascii');
  return h;
};
writeFileSync(out, Buffer.concat([header, chunkHeader(jsonChunk.length, 'JSON'), jsonChunk, chunkHeader(bin.length, 'BIN\0'), bin]));
console.log(`${src}: ${glb.length} bytes -> ${out}: ${total} bytes`);
