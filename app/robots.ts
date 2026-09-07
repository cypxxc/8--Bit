import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';
export default function robots():MetadataRoute.Robots {
  const origin=siteOrigin();
  return {rules:{userAgent:'*',...(origin?{allow:'/',disallow:['/admin','/api/']}:{disallow:'/'})},...(origin?{sitemap:`${origin}/sitemap.xml`}:{})};
}
