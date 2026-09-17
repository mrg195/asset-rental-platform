import { defineCollection, z } from 'astro:content';

const properties = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['房屋', '商铺', '办公楼']),
    address: z.string(),
    area: z.number().positive(),
    condition: z.enum(['空置', '简装', '精装', '毛坯']),
    image1: z.string().optional(),
    image2: z.string().optional(),
    image3: z.string().optional(),
    contact_name: z.string(),
    phone: z.string(),
    work_hours: z.string().default('周一至周五 9:00-17:00'),
    wechat: z.string().optional(),
    date: z.coerce.date(),
  }),
});

const lands = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    location: z.string(),
    area: z.number().positive(),
    image1: z.string().optional(),
    image2: z.string().optional(),
    image3: z.string().optional(),
    contact_name: z.string(),
    phone: z.string(),
    work_hours: z.string().default('周一至周五 9:00-17:00'),
    wechat: z.string().optional(),
    date: z.coerce.date(),
  }),
});

const announcements = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    pinned: z.boolean().default(false),
  }),
});

const company = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { properties, lands, announcements, company };
