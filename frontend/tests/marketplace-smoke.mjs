import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { matchedPhoto } from '../src/productImageSources.js';

// Ensure imported product matchers use real whitespace escapes (not literal slash-s).
for (const [name, fragment] of [
  ['Choynak 1 L', 'Teapot.jpeg'],
  ['Elektr choynak', 'Electric kettle.jpg'],
  ['KitKat 41 g', 'KitKat.jpg'],
  ['Pantene shampun 400 ml', 'Pantene'],
  ['Kir sovuni 200 g', 'Diao_Pai']
]) {
  const match = matchedPhoto({name});
  assert.ok(match?.photo, 'Missing product photo for '+name);
  assert.ok(decodeURIComponent(match.photo).toLowerCase().includes(fragment.toLowerCase().replaceAll('_',' ')),
    'Incorrect photo for '+name);
}

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
  // Isolated test substitute for external product photo hosts: verify the
  // correct product-specific image URL is selected without external network calls.
  await page.route('https://yastatic.net/**',route=>route.fulfill({
    status:200,contentType:'image/png',
    body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')
  }));
}
async function runDesktop() {
  const context=await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(12000);
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await useMockData(page);
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.mm-product-card').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.mm-product-card').count(),3,'Catalog should show all three mocked products');
  assert.equal(await page.locator('.mm-v3-hero').count(),1,'New hero should render');
  assert.equal(await page.locator('.mm-product-card').filter({hasText:'Fanta'})
    .locator('img[src*="yastatic.net"]').count(),1,'Specific Fanta image is used instead of the category emoji');
  await page.waitForFunction(() => {
    const photo = document.querySelector('.mm-product-card img[src="/nivea.webp"]');
    return photo && photo.complete && photo.naturalWidth > 0;
  }, null, {timeout:12000});
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
  await page.locator('.nm-drawer-top .nm-icon-btn').click();
  await page.route('**/api/orders/mine',route=>route.fulfill({status:200,contentType:'application/json',
    body:JSON.stringify([{id:501,created_at:new Date().toISOString(),total_amount:32000,
      items:[{id:1,product_name:'Nivea dus geli 250 ml',quantity:1,status:'Jarayonda',
        estimated_delivery_at:new Date(Date.now()+86400000).toISOString()}]}])}));
  await page.locator('.nm-account-trigger').click();
  await page.locator('.nm-dialog').getByText('Taxminiy yetkazish').waitFor();
  assert.ok(await page.locator('.mm-order-delivery').first().isVisible(),'Buyer should see ETA after acceptance');
  await page.locator('.nm-dialog-heading .nm-icon-btn').click();
  await page.screenshot({path:'smoke-desktop.png',fullPage:true});
  assert.deepEqual(errors,[],'Frontend must not produce JavaScript runtime errors');
  await context.close();
}



async function runCategoryIntegrity() {
  const baseItems=[
    {id:3101,name:'Kichik stol lampasi',category:'Uy jihozlari',price:55000},
    {id:3102,name:'Fairy idish yuvish vositasi',category:'Maishiy kimyo',price:24000}
  ].map(p=>({description:'Test',stock:5,image_url:'',is_active:true,seller_name:'MiniMarket',
    created_at:'2026-11-01T00:00:00Z',...p}));
  async function pageFor(items,viewport) {
    const context=await browser.newContext({viewport,reducedMotion:'reduce'});
    const page=await context.newPage();
    page.setDefaultTimeout(15000);
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await useMockData(page);
    await page.route('**/api/products',route=>route.fulfill({
      status:200,contentType:'application/json',body:JSON.stringify(items)
    }));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.locator('.nm-category-tile').first().waitFor();
    await page.getByText('Katalog yangilandi').first().waitFor();
    return {context,page,errors};
  }

  // Previously category filtering required exact apostrophe characters.
  const variant={...baseItems[0],id:3103,name:'Choynak 1 L',category:"Uy-roʻzgʻor"};
  let instance=await pageFor([...baseItems,variant],{width:1280,height:850});
  let {context,page,errors}=instance;
  await page.locator('.mm-category-tile[aria-label="Uy-ro‘zg‘or"]').click();
  assert.equal(await page.locator('.mm-product-card').count(),1,
    'Equivalent Uzbek apostrophe variants belong to the same category');
  assert.ok(await page.getByText('Choynak 1 L').first().isVisible());
  assert.equal(await page.locator('[data-testid=empty-category]').count(),0);
  assert.deepEqual(errors,[],'No runtime errors when category names differ in apostrophes');
  await context.close();

  // Empty categories should not pretend to contain unrelated items.
  instance=await pageFor(baseItems,{width:390,height:844});
  ({context,page,errors}=instance);
  await page.locator('.mm-category-tile[aria-label="Uy-ro‘zg‘or"]').click();
  await page.locator('[data-testid=empty-category]').waitFor();
  assert.ok(await page.getByText('Bu bo‘limga hali mahsulot qo‘shilmagan').isVisible(),
    'Empty category must be described honestly');
  assert.equal(await page.locator('.mm-related-grid .mm-product-card').count(),2,
    'Related products should show actual items from other categories');
  assert.equal(await page.locator('.nm-catalog-meta strong').innerText(),'0',
    'Original empty category count must remain zero');
  await page.locator('.mm-related-grid .mm-product-card').first().locator('.mm-card-add').click();
  await page.locator('.nm-mobile-tabs button').filter({hasText:'Savatcha'}).click();
  assert.ok(await page.locator('.nm-cart-item').isVisible(),'Related product adds to cart on mobile');
  await page.screenshot({path:'smoke-empty-category-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No mobile runtime errors on empty categories');
  await context.close();
}


async function runRealProductPhotos() {
  const cases=[
    ['Choynak 1 L','Uy-ro‘zg‘or','Porcelain_Teapot.jpg'],
    ['Elektr choynak','Uy-ro‘zg‘or','Electric-kettle.jpg'],
    ['KitKat 41 g','Shirinliklar','KitKat.jpg'],
    ['Pantene shampun 400 ml','Gigiyena vositalari','Shampoo_und_Pflegesp%C3%BClung_Pantene_V1.jpg']
  ];
  const products=cases.map(([name,category],i)=>({
    id:25000+i,name,category,price:22000,stock:7,image_url:'',
    description:'Rasm sinovi',is_active:true,seller_name:'MiniMarket',
    created_at:'2026-11-01T00:00:00Z'
  }));
  products.push({id:25020,name:'Un 2 kg',category:'Oziq-ovqat mahsulotlari',
    price:12000,stock:10,image_url:'',is_active:true,seller_name:'MiniMarket'});
  const context=await browser.newContext({viewport:{width:1280,height:840},reducedMotion:'reduce'});
  const page=await context.newPage();
  await useMockData(page);
  await page.route('**/api/products', route=>route.fulfill({
    status:200,contentType:'application/json',body:JSON.stringify(products)
  }));
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.mm-product-card').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.mm-product-card').count(),5);
  const distinct = new Set();
  for(const [name,,fileName] of cases) {
    const card=page.locator('.mm-product-card').filter({hasText:name});
    const img=card.locator('img');
    assert.equal(await img.count(),1,'Real photo URL for '+name);
    const url=await img.getAttribute('src');
    assert.ok(url.includes('commons.wikimedia.org/wiki/Special:Redirect/file/'),
      'Use photo source, not cartoon illustration: '+name);
    assert.ok(url.includes(fileName),'Source filename must match '+name);
    assert.ok(!url.includes('.svg'),'No cartoon illustration');
    distinct.add(url);
  }
  assert.equal(distinct.size,4,'Every item uses a different real photo source');
  const missing=page.locator('.mm-product-card').filter({hasText:'Un 2 kg'});
  assert.equal(await missing.locator('img[src*="/products/"]').count(),0,
    'Old generated grocery cartoons must not be presented as photos');
  await context.close();
}

async function runSeller() {
  const context=await browser.newContext({viewport:{width:1360,height:820},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(12000);
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await useMockData(page);
  await page.route('**/api/auth/login', route=>route.fulfill({
    status:200,contentType:'application/json',body:JSON.stringify({
      token:'seller-token',user:{id:998,name:'Test Seller',email:'seller@example.test',role:'seller'}
    })
  }));
  await page.route('**/api/auth/me', route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({id:998,name:'Test Seller',email:'seller@example.test',role:'seller'})
  }));
  const sellerOrders=[{item_id:725,order_id:400,product_name:'Fanta 1.5 L',quantity:1,
    unit_price:16000,customer_name:'Test Buyer',phone:'+998 90 123 45 67',
    address:'Tashkent',status:'Yangi',estimated_delivery_at:null}];
  let savedEta=null;
  await page.route('**/api/seller/**', route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/seller/orders/725' && route.request().method()==='PATCH') {
      const data=route.request().postDataJSON();
      assert.equal(data.status,'Jarayonda','Seller should accept order');
      assert.ok(Date.parse(data.estimated_delivery_at)>Date.now(),'Seller ETA must be future');
      savedEta=data.estimated_delivery_at;
      sellerOrders[0].status='Jarayonda';sellerOrders[0].estimated_delivery_at=savedEta;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,item:sellerOrders[0]})});
    }
    const body=path==='/api/seller/products' ? inventory :
      path==='/api/seller/orders' ? sellerOrders : [];
    route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  let photoUploaded=false;
  await page.route('**/api/seller/products/*/image',route=>{
    photoUploaded=true;
    assert.equal(route.request().method(),'PUT');
    assert.equal(route.request().headers()['content-type'],'image/png');
    route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({ok:true,image_url:'/api/product-images/10004'})});
  });
  await page.route('**/api/products/**', route=>route.fulfill({
    status:200,contentType:'application/json',body:JSON.stringify({ok:true})
  }));
  await page.route('**/api/products', route=>{
    const method=route.request().method();
    route.fulfill({status:method==='POST'?201:200,contentType:'application/json',
      body:JSON.stringify(method==='POST'?{id:10004}:inventory)});
  });
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.mm-product-card').first().waitFor();
  await page.locator('.nm-signin').click();
  await page.locator('.nm-dialog form input[name=email]').fill('seller@example.test');
  await page.locator('.nm-dialog form input[name=password]').fill('password123');
  await page.locator('.nm-dialog form button[type=submit]').click();
  await page.locator('.nm-dialog').waitFor({state:'detached'});
  await page.locator('.nm-account-trigger').click();
  const modal=page.locator('.nm-dialog');
  await modal.waitFor();
  await modal.locator('.nm-seller-tabs button').nth(1).click();
  const orderRow=modal.locator('.mm-seller-order');
  await orderRow.waitFor();
  await orderRow.locator('select').selectOption('Jarayonda');
  assert.ok(await orderRow.locator('.mm-eta-validation').isVisible(),'Seller must set delivery date before accepting');
  const etaInput=new Date(Date.now()+48*3600000+5*3600000).toISOString().slice(0,16);
  await orderRow.locator('input[type=datetime-local]').fill(etaInput);
  await orderRow.locator('.mm-order-save').click();
  await page.getByText('Buyurtma holati va yetkazish vaqti saqlandi').waitFor();
  assert.ok(savedEta,'Confirmed ETA should reach API');
  await modal.locator('.nm-seller-tabs button').first().click();
  await modal.locator('.nm-add-product').click();
  const form=modal.locator('form.nm-product-form');
  await form.locator('[name=name]').fill('Test new product');
  await form.locator('[name=description]').fill('Test product description');
  await form.locator('[name=price]').fill('5000');
  await form.locator('[name=stock]').fill('6');
  await form.locator('input[name=photo]').setInputFiles({
    name:'sample-product.png',mimeType:'image/png',
    buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')
  });
  await form.locator('button[type=submit]').click();
  await modal.locator('.nm-add-product').waitFor();
  assert.ok(await page.getByText('Mahsulot saqlandi').count()>0,'Seller product save should succeed');
  assert.ok(photoUploaded,'Seller product image should be uploaded after product creation');
  await modal.locator('.nm-manage-item button[aria-label="Tahrirlash"]').first().click();
  await modal.locator('form.nm-product-form [name=price]').fill('6000');
  await modal.locator('form.nm-product-form button[type=submit]').click();
  await modal.locator('.nm-add-product').waitFor();
  page.on('dialog',confirm=>confirm.accept());
  await modal.locator('.nm-manage-item button[aria-label="O‘chirish"]').first().click();
  await page.getByText('Mahsulot o‘chirildi').waitFor({timeout:12000});
  assert.ok(await page.getByText('Mahsulot o‘chirildi').isVisible(),'Seller delete button should call backend');
  await modal.locator('.nm-dialog-heading .nm-icon-btn').click();
  assert.equal(await modal.count(),0,'Seller dashboard should close');
  assert.deepEqual(errors,[],'Seller controls must not produce JS runtime errors');
  await context.close();
}


async function runOrderHistoryRetry() {
  const context=await browser.newContext({viewport:{width:1280,height:850},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(15000);
  await useMockData(page);
  let requested=0;
  await page.route('**/api/orders/mine',route=>{
    requested++;
    if(requested<=2) return route.fulfill({
      status:503,contentType:'application/json',body:JSON.stringify({error:'Server vaqtincha band'})
    });
    return route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify([{id:900,created_at:new Date().toISOString(),total_amount:25000,
        items:[{id:901,product_name:'Tuxum 10 dona',quantity:1,status:'Yangi'}]}])
    });
  });
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.nm-signin').click();
  await page.locator('.nm-dialog [name=email]').fill('buyer@example.test');
  await page.locator('.nm-dialog [name=password]').fill('password123');
  await page.locator('.nm-dialog form button[type=submit]').click();
  await page.locator('.nm-dialog').waitFor({state:'detached'});
  await page.locator('.nm-account-trigger').click();
  await page.getByText('Server vaqtincha band').waitFor();
  await page.locator('.mm-orders-error button').click();
  await page.getByText('Buyurtma #900').waitFor();
  assert.ok(requested>=3,'Retry must issue a new authenticated request');
  await page.locator('.nm-dialog-heading .nm-icon-btn').click();
  await page.locator('.nm-account-trigger').click();
  assert.ok(await page.getByText('Buyurtma #900').isVisible(),
    'Recently loaded orders should appear immediately from memory');
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
let exitCode = 0;
try {
  await waitForServer();
  browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  await runDesktop();
  console.log('PASS desktop: catalog, search, categories, favorites, filters, detail, cart, checkout');
  await runRealProductPhotos();
  console.log('PASS images: four distinct real-source URLs; no cartoon image defaults');
  await runCategoryIntegrity();
  console.log('PASS category integrity: apostrophe aliases, empty sections, mobile related-product purchase');
  await runSeller();
  console.log('PASS seller: ETA confirmation, product photo upload, creation, editing and deletion');
  await runMobile();
  console.log('PASS mobile: catalog, card, cart, tab navigation');
  await runOrderHistoryRetry();
  console.log('PASS orders: failed fetch retry and instant cached reopen');
} catch (error) {
  console.error('FAIL marketplace browser test:', error);
  exitCode = 1;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  // npm spawns Vite as a child; Node's inherited pipes otherwise keep CI alive.
  process.exit(exitCode);
}
