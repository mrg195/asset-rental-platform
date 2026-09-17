#!/usr/bin/env node
/**
 * 生成示例资产数据：50 项房屋/商铺/办公楼 + 6 项土地
 * 用法：npm run gen-sample
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const propertiesDir = join(root, 'src', 'content', 'properties');
const landsDir = join(root, 'src', 'content', 'lands');
mkdirSync(propertiesDir, { recursive: true });
mkdirSync(landsDir, { recursive: true });

const towns = ['城关镇', '河东镇', '西河镇', '北山镇', '南塘乡', '东坪乡'];
const roads = ['人民路', '建设路', '解放路', '文化路', '商业街', '滨江大道', '育才路'];
const contacts = ['张主任', '李主任', '王科长', '陈科长', '刘主任', '赵科长'];
const conditions = ['空置', '简装', '精装', '毛坯'];

function iso(startDays, i, step) {
  return new Date(Date.UTC(2025, 0, 6) + (startDays + i * step) * 86400000).toISOString().slice(0, 10);
}

function frontmatter(obj) {
  return '---\n' + Object.entries(obj)
    .map(([k, v]) => (typeof v === 'number' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`))
    .join('\n') + '\n---\n';
}

let count = 0;
for (let i = 0; i < 50; i++) {
  const town = towns[i % towns.length];
  const road = roads[i % roads.length];
  const num = ((i * 7) % 180) + 2;
  let type, title, area;
  if (i < 20) {
    type = '商铺';
    area = 45 + ((i * 13) % 28) * 10;
    title = `${town}${road}${num}号沿街商铺（一层）`;
  } else if (i < 35) {
    type = '房屋';
    area = 60 + ((i * 11) % 21) * 10;
    const unit = (i % 3) + 1;
    const floor = 2 + (i % 5);
    const room = 1 + (i % 8);
    title = `${town}${road}${num}号住房${unit}单元${floor}0${room}室`;
  } else {
    type = '办公楼';
    area = 300 + ((i * 17) % 16) * 100;
    title = `${town}${road}${num}号办公楼（${1 + (i % 3)}层）`;
  }
  const data = {
    title,
    type,
    address: `XX县${town}${road}${num}号`,
    area,
    condition: conditions[(i * 3 + (i >> 2)) % 4],
    contact_name: contacts[i % contacts.length],
    phone: `0791-8688${String(i + 1).padStart(3, '0')}`,
    work_hours: '周一至周五 9:00-17:00',
    wechat: `xxzgzc${String(i + 1).padStart(2, '0')}`,
    date: iso(0, i, 2),
  };
  writeFileSync(join(propertiesDir, `prop-${String(i + 1).padStart(3, '0')}.md`), frontmatter(data));
  count++;
}

const lands = [
  { title: '河东镇河东村东侧工业用地', location: 'XX县河东镇河东村东侧（S103省道旁）', area: 86 },
  { title: '西河镇滨江大道商业用地', location: 'XX县西河镇滨江大道中段', area: 36 },
  { title: '城关镇城东新区商住用地', location: 'XX县城关镇城东新区规划路以北', area: 152 },
  { title: '北山镇林场仓储用地', location: 'XX县北山镇林场南侧', area: 45 },
  { title: '南塘乡南塘村建设用地', location: 'XX县南塘乡南塘村村委会以东', area: 28 },
  { title: '东坪乡东坪村工业用地', location: 'XX县东坪乡东坪村工业园区', area: 210 },
];
lands.forEach((l, i) => {
  const data = {
    ...l,
    contact_name: contacts[(i + 2) % contacts.length],
    phone: `0791-8688${String(101 + i).padStart(3, '0')}`,
    work_hours: '周一至周五 9:00-17:00',
    wechat: `xxzgzc${String(61 + i)}`,
    date: iso(105, i, 5),
  };
  writeFileSync(join(landsDir, `land-00${i + 1}.md`), frontmatter(data));
});
console.log(`已生成：${count} 项房屋/商铺/办公楼 + ${lands.length} 项土地 → src/content/{properties,lands}/`);
