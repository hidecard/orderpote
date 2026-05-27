import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const turso = createClient({
  url: 'libsql://orderpote-hidecatd.aws-ap-northeast-1.turso.io',
  authToken: process.env.VITE_TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    // 1. Fetch product data from Turso
    const result = await turso.execute({
      sql: 'SELECT * FROM products WHERE slug = ? AND is_active = 1',
      args: [slug],
    });

    if (result.rows.length === 0) {
      // Fallback to index.html if product not found
      return serveIndex(res);
    }

    const product = result.rows[0];
    
    // 2. Fetch store data
    const storeResult = await turso.execute({
      sql: 'SELECT * FROM stores WHERE user_id = ?',
      args: [product.user_id],
    });
    const store = storeResult.rows[0];

    // 3. Prepare meta data
    const title = store 
      ? `${product.name} | ${store.name} | OrderPote`
      : `${product.name} | OrderPote`;
    
    const description = product.description || `${product.name} ကို OrderPote တွင် မှာယူပါ။`;
    const image = product.cover_image_url || 'https://orderpote.vercel.app/logo.png';
    const url = `https://orderpote.vercel.app/order/${slug}`;

    // 4. Read index.html and inject meta tags
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) {
      // If dist/index.html doesn't exist, try reading from root (for local testing or specific Vercel setups)
      const rootIndexPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(rootIndexPath)) {
        var html = fs.readFileSync(rootIndexPath, 'utf8');
      } else {
        return res.status(500).send('Template မတွေ့ရှိပါ');
      }
    } else {
      var html = fs.readFileSync(indexPath, 'utf8');
    }

    // Replace default meta tags with product-specific ones
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    const metaTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'description', content: description }
    ];

    metaTags.forEach(tag => {
      const attr = tag.property ? 'property' : 'name';
      const key = tag.property || tag.name;
      const regex = new RegExp(`<meta ${attr}="${key}" content=".*?" \/?>`, 'i');
      const newTag = `<meta ${attr}="${key}" content="${tag.content}" />`;
      
      if (html.match(regex)) {
        html = html.replace(regex, newTag);
      } else {
        // If tag doesn't exist, inject it before </head>
        html = html.replace('</head>', `${newTag}\n</head>`);
      }
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('OG Error:', error);
    return serveIndex(res);
  }
}

function serveIndex(res) {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }
  return res.status(404).send('မတွေ့ရှိပါ');
}
