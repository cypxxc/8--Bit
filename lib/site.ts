// Set only to the shop's verified production origin. Never infer a deployment URL.
export function siteOrigin(): string | undefined {
  try { const url=new URL(process.env.SITE_URL || '');
    if(url.protocol!=='https:' || url.username || url.password || url.hostname==='localhost')return undefined;
    return url.origin;
  } catch {return undefined;}
}
