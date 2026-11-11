import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:5173';
const inventory = [
  { id: 10001, name: 'Nivea dus geli 250 ml', description:'Test product', price: 32000, category:'Gigiyena vositalari', stock:3, image_url:'', is_active:true, seller_name:'MiniMarket', created_at:'2026-11-01T00:00:00Z' },
  { id: 10002, name:'Fanta 1.5 L', description:'Test drink', price:16000, category:'Ichimliklar', stock:4, image_url:'', is_active:true, seller_name:'MiniMarket', created_at:'2026-11-02T00:00:00Z' },
  { id: 10003, name:'Fairy 450 ml', description:'Out of stock test', price:22000, category:'Maishiy kimyo', stock:0, image_url:'', is_active:true, seller_name:'MiniMarket', created_at:'2026-11-03T00:00:00Z' },
];
const server = spawn('npm', ['run','dev','--','--host','127.0.0.1','--port','5173','--strictPort'], { cwd:process.cwd(), stdio:['ignore','pipe','pipe'] });
server.stdout.on('data',data=>process.stdout.write(data));
server.stderr.on('data',data=>process.stderr.write(data));
let browser;
async function waitForServer() {
  for (let i=0;i<70;i++) {
    try { const r=await fetch(origin); if(r.ok) return; } catch {}
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  throw new Error('Frontend dev server did not become ready');
}
async function useMockData(page) {
  await page.route('**/api/**', async route => {
    const request=route.request();
    const url=new URL(request.url());
    const path=url.pathname;
    if(path==='/api/products' && request.method()==='GET') {
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(inventory)});
    }
    if(path==='/api/auth/me') {
      return route.fulfill({status:200,contentType:'application/json',
        body:JSON.stringify({id:999,name:'Test Buyer',email:'buyer@example.test',role:'buyer'})});
    }
    if(path==='/api/auth/login') {
      return route.fulfill({status:200,contentType:'application/json',
        body:JSON.stringify({token:'test-token',user:{id:999,name:'Test Buyer',email:'buyer@example.test',role:'buyer'}})});
    }
    if(path==='/api/orders' && request.method()==='POST') {
      const data=request.postDataJSON();
      assert.ok(data.items.length>0,'Checkout must include cart items');
      assert.ok(data.phone,'Checkout must include telephone');
      return route.fulfill({status:201,contentType:'application/json',
        body:JSON.stringify({id:501,total_amount:32000})});
    }
    return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  // The external Google login widget is not needed for our isolated smoke tests.
  await page.route('**/accounts.google.com/**',route=>route.abort());
}
async function runDesktop() {
  const context=await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await useMockData(page);
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.mm-product-card').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.mm-product-card').count(),3,'Catalog should show all three mocked products');
  assert.equal(await page.locator('.mm-v3-hero').count(),1,'New hero should render');
  const broken=await page.locator('img').evaluateAll(nodes=>nodes.filter(img=>img.complete && img.naturalWidth===0).map(img=>img.src));
  assert.deepEqual(broken,[],'No broken product images on initial load');
  await page.locator('.mm-v3-hero .mm-button-dark').click();
  await page.waitForTimeout(180);
  assert.ok(await page.locator('#catalog').isVisible(),'Shopping CTA should reveal the catalog');
  await page.locator('.mm-category-tile').filter({hasText:'Gigiyena vositalari'}).click();
  assert.equal(await page.locator('.mm-product-card').count(),1,'Category tile should filter products');
  const search=page.locator('.nm-search input');
  await search.fill('Fanta');
  await page.locator('.nm-search-btn').click();
  assert.equal(await page.locator('.mm-product-card').count(),1,'Global search should clear selected category');
  // Clicking the catalog navigation must reset previous category/search filters.
  await page.locator('.nm-all-nav').click();
  assert.equal(await page.locator('.mm-product-card').count(),3,'All-products navigation should reset filters');
  await search.fill('Fanta');
  await page.locator('.nm-search-btn').click();
  assert.equal(await page.locator('.mm-product-card').count(),1,'Search should find matching products');
  await page.locator('.mm-product-card .nm-love').click();
  await page.locator('.nm-header-icon[aria-label="Sevimlilar"]').click();
  assert.equal(await page.locator('.mm-product-card').count(),1,'Favorite products should show in favorites filter');
  await page.locator('.nm-all-nav').click();
  await page.locator('.mm-stock-filter input[type=checkbox]').check();
  assert.equal(await page.locator('.mm-product-card').count(),2,'In-stock filter should exclude sold-out items');
  await page.locator('.mm-stock-filter input[type=checkbox]').uncheck();
  await page.locator('.mm-product-card').filter({hasText:'Nivea'}).locator('.mm-card-image-trigger').click();
  const detail=page.locator('.nm-dialog[role=dialog]');
  await detail.waitFor();
  assert.ok(await detail.getByRole('heading',{name:'Nivea dus geli 250 ml'}).first().isVisible(),'Product detail should open');
  await detail.locator('.nm-detail-actions .nm-primary').click();
  assert.equal(await detail.count(),0,'Product detail should close on valid add');
  await page.locator('.nm-header-icon[aria-label="Savatcha"]').click();
  const drawer=page.locator('.nm-cart-drawer');
  await drawer.waitFor();
  await drawer.locator('.nm-stepper button').nth(1).click();
  assert.equal(await drawer.locator('.nm-stepper span').innerText(),'2','Cart increment should work');
  await drawer.locator('.nm-stepper button').nth(0).click();
  assert.equal(await drawer.locator('.nm-stepper span').innerText(),'1','Cart decrement should work');
  await drawer.locator('.nm-cart-footer .nm-primary').click();
  assert.ok(await page.locator('.nm-dialog').isVisible(),'Anonymous checkout should open sign-in');
  await page.locator('.nm-dialog form input[name=email]').fill('buyer@example.test');
  await page.locator('.nm-dialog form input[name=password]').fill('password123');
  await page.locator('.nm-dialog form button[type=submit]').click();
  await page.locator('.nm-dialog').waitFor({state:'detached'});
  await page.locator('.nm-header-icon[aria-label="Savatcha"]').click();
  await page.locator('.nm-cart-footer .nm-primary').click();
  const form=page.locator('.nm-dialog form');
  await form.locator('[name=phone]').fill('+998 90 123 45 67');
  await form.locator('[name=address]').fill('Toshkent, Amir Temur 12');
  await form.locator('button[type=submit]').click();
  await page.locator('.nm-dialog').waitFor({state:'detached'});
  await page.locator('.nm-header-icon[aria-label="Savatcha"]').click();
  assert.ok(await page.locator('.nm-empty-cart').isVisible(),'Cart should empty after successful order');
  await page.screenshot({path:'smoke-desktop.png',fullPage:true});
  assert.deepEqual(errors,[],'Frontend must not produce JavaScript runtime errors');
  await context.close();
}
async function runMobile() {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await useMockData(page);
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.mm-product-card').first().waitFor({timeout:15000});
  assert.ok(await page.locator('.mm-v3-hero').isVisible(),'Mobile hero should render');
  await page.locator('.nm-mobile-tabs button').filter({hasText:'Savatcha'}).click();
  assert.ok(await page.locator('.nm-cart-drawer').isVisible(),'Mobile cart tab must open cart');
  await page.locator('.nm-empty-cart .nm-primary').click();
  await page.locator('.mm-product-card').filter({hasText:'Fanta'}).locator('.mm-card-image-trigger').click();
  assert.ok(await page.locator('.nm-dialog').isVisible(),'Mobile product quick view must work');
  await page.locator('.nm-dialog .nm-detail-actions .nm-primary').click();
  await page.locator('.nm-mobile-tabs button').filter({hasText:'Savatcha'}).click();
  assert.ok(await page.locator('.nm-cart-item').isVisible(),'Mobile add-to-cart should work');
  await page.locator('.nm-drawer-top .nm-icon-btn').click();
  assert.equal(await page.locator('.nm-cart-drawer').count(),0,'Mobile cart close should work');
  await page.screenshot({path:'smoke-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'Mobile frontend must not produce JS runtime errors');
  await context.close();
}
try {
  await waitForServer();
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  await runDesktop();
  console.log('PASS desktop: catalog, search, categories, favorites, filters, detail, cart, checkout');
  await runMobile();
  console.log('PASS mobile: catalog, card, cart, tab navigation');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
