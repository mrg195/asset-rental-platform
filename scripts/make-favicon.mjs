#!/usr/bin/env node
/**
 * 生成 public/favicon.ico（32x32 蓝色楼宇图标）
 * 用法：npm run make-favicon
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 32, H = 32;
const px = Buffer.alloc(W * H * 4);
// BGR channels for 32bpp BMP rows
const bg = [0x6b, 0x3a, 0x1a];   // #1a3a6b
const white = [0xff, 0xff, 0xff];
const light = [0xa7, 0x5e, 0x2b]; // #2b5ea7

// Draw bottom-up (Y0 = bottom row)
for (let displayY = 0; displayY < H; displayY++) {
  const y = H - 1 - displayY;
  for (let x = 0; x < W; x++) {
    let c = bg;
    const inBuilding = x >= 9 && x <= 22 && y >= 8 && y <= 26;
    if (inBuilding) {
      c = white;
      // windows (2x3 pixels each)
      const windows = [[11,10],[15,10],[19,10],[11,14],[15,14],[19,14],[11,18],[19,18]];
      for (const [wx, wy] of windows) {
        if (x >= wx && x < wx + 2 && y >= wy && y < wy + 3) c = light;
      }
      // door
      if (x >= 14 && x <= 17 && y >= 22 && y <= 26) c = light;
    }
    const o = (displayY * W + x) * 4;
    px[o] = c[0];
    px[o + 1] = c[1];
    px[o + 2] = c[2];
    px[o + 3] = 0xff;
  }
}

// AND mask (all zeros = fully opaque)
const maskSize = Math.ceil(W / 8) * 4 * H;
const mask = Buffer.alloc(maskSize);

// BITMAPINFOHEADER (40 bytes)
const bih = Buffer.alloc(40);
bih.writeUInt32LE(40, 0);
bih.writeInt32LE(W, 4);
bih.writeInt32LE(H * 2, 8); // height is doubled for icon (color + mask)
bih.writeUInt16LE(1, 12);
bih.writeUInt16LE(32, 14);
bih.writeUInt32LE(0, 16); // compression none
bih.writeUInt32LE(W * H * 4, 20); // imageSize
const image = Buffer.concat([bih, px, mask]);

// ICONDIR (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // IMAGE_ICON
header.writeUInt16LE(1, 4); // count = 1

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2); // colors (0 = 32bpp)
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bitcount
entry.writeUInt32LE(image.length, 8);
entry.writeUInt32LE(6 + 16, 12); // offset

writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'favicon.ico'), Buffer.concat([header, entry, image]));
console.log('已生成 public/favicon.ico');
