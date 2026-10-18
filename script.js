const products = [
  {id:1,name:"Wireless Headphones",category:"Tech",price:1299,emoji:"🎧",tag:"BESTSELLER",bg:"#e4e0cf",description:"Warm sound for your everyday."},
  {id:2,name:"Classic Wristwatch",category:"Accessories",price:1599,emoji:"⌚",tag:"SIGNATURE",bg:"#e4d6c3",description:"A timeless detail for any day."},
  {id:3,name:"Everyday Backpack",category:"Lifestyle",price:899,emoji:"🎒",tag:"",bg:"#d9ded0",description:"A dependable daily companion."},
  {id:4,name:"Compact Speaker",category:"Tech",price:749,emoji:"🔊",tag:"NEW",bg:"#ded8e0",description:"Small size, lovely sound."},
  {id:5,name:"Vintage Sunglasses",category:"Accessories",price:399,emoji:"🕶️",tag:"",bg:"#e9dfbf",description:"A little character in every look."},
  {id:6,name:"Ceramic Coffee Mug",category:"Home",price:249,emoji:"☕",tag:"",bg:"#e8dfd1",description:"For slow mornings and warm drinks."},
  {id:7,name:"Classic Desk Lamp",category:"Home",price:599,emoji:"💡",tag:"",bg:"#e2e3d3",description:"A softer glow for your space."},
  {id:8,name:"Canvas Tote Bag",category:"Lifestyle",price:199,emoji:"👜",tag:"ECO PICK",bg:"#e9d9c6",description:"Simple, useful, and easy to carry."},
  {id:9,name:"Wireless Mouse",category:"Tech",price:449,emoji:"🖱️",tag:"",bg:"#d8e0df",description:"A smooth desktop essential."},
  {id:10,name:"Travel Bottle",category:"Lifestyle",price:329,emoji:"🧴",tag:"",bg:"#d6e2d8",description:"Keep your favorite drink close."},
  {id:11,name:"Phone Stand",category:"Accessories",price:179,emoji:"📱",tag:"",bg:"#ded9e6",description:"A comfortable viewing angle."},
  {id:12,name:"Cozy Throw Pillow",category:"Home",price:499,emoji:"🛋️",tag:"",bg:"#e8d8d3",description:"A cozy finishing touch for home."}
];

const cart = new Map();
let activeCategory = "All";
let searchTerm = "";
const money = value => new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(value);
const $ = selector => document.querySelector(selector);
const productGrid = $("#product-grid");
const cartItems = $("#cart-items");
const toast = $("#toast");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(()=>toast.classList.remove("show"),2200);
}

function renderProducts(){
  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
  $("#product-count").textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} in the collection`;
  if(!filtered.length){
    productGrid.innerHTML = '<div class="no-results">Nothing found. Try another search or category.</div>';
    return;
  }
  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-art" style="--product-bg:${product.bg}">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
        <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom"><span class="price">${money(product.price)}</span>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button>
        </div>
      </div>
    </article>`).join("");
}

function addToCart(id){
  const item = cart.get(id);
  if(item) item.quantity++;
  else cart.set(id,{product:products.find(product=>product.id===id),quantity:1});
  renderCart();
  showToast("Added to your bag");
}

function changeQuantity(id, amount){
  const item = cart.get(id);
  if(!item) return;
  item.quantity += amount;
  if(item.quantity <= 0) cart.delete(id);
  renderCart();
}

function renderCart(){
  const entries = [...cart.values()];
  const count = entries.reduce((sum,item)=>sum+item.quantity,0);
  const subtotal = entries.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const delivery = subtotal === 0 || subtotal >= 1500 ? 0 : 80;
  $("#cart-count").textContent = count;
  $("#subtotal").textContent = money(subtotal);
  $("#delivery").textContent = money(delivery);
  $("#total").textContent = money(subtotal+delivery);
  if(!entries.length){
    cartItems.innerHTML = '<div class="empty-cart">Your bag is waiting for something lovely.</div>';
    return;
  }
  cartItems.innerHTML = entries.map(({product,quantity})=>`
    <article class="cart-row">
      <div class="cart-thumb" style="--product-bg:${product.bg}" aria-hidden="true">${product.emoji}</div>
      <div class="cart-details"><div class="cart-name">${product.name}</div><div class="cart-unit">${money(product.price)} each</div></div>
      <div class="quantity-control" aria-label="Quantity controls for ${product.name}">
        <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
        <span>${quantity}</span>
        <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-line-total">${money(product.price*quantity)}<br><button class="remove-button" type="button" data-remove="${product.id}">Remove</button></div>
    </article>`).join("");
}

productGrid.addEventListener("click",event=>{
  const button = event.target.closest("[data-add]");
  if(button) addToCart(Number(button.dataset.add));
});
cartItems.addEventListener("click",event=>{
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if(quantityButton) changeQuantity(Number(quantityButton.dataset.quantity),Number(quantityButton.dataset.change));
  if(removeButton){cart.delete(Number(removeButton.dataset.remove));renderCart();showToast("Item removed");}
});
$("#category-filters").addEventListener("click",event=>{
  const button = event.target.closest("[data-category]");
  if(!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(filter=>filter.classList.toggle("active",filter===button));
  renderProducts();
});
$("#search-input").addEventListener("input",event=>{
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});
$("#cart-jump").addEventListener("click",()=>$("#cart").scrollIntoView({behavior:"smooth"}));
$("#checkout-jump").addEventListener("click",()=>{
  if(cart.size===0){showToast("Add an item before checkout");return;}
  $("#checkout").scrollIntoView({behavior:"smooth"});
});
$("#clear-cart").addEventListener("click",()=>{
  if(!cart.size){showToast("Your bag is already empty");return;}
  cart.clear();renderCart();showToast("Bag cleared");
});
$("#payment-method").addEventListener("change",event=>{
  const method = event.target.value;
  const hint = $("#payment-hint");
  hint.textContent = ["GCash","GoTyme Bank","Maya","ShopeePay","GrabPay","Other e-wallet"].includes(method)
    ? `${method} selected. This demo records your choice only; it does not open a payment gateway or charge your account.`
    : method === "Cash on Delivery" ? "Cash on Delivery selected. Pay when your sample order is delivered." : "Choose your preferred payment method. Online payments are shown as demo options only.";
});
$("#checkout-form").addEventListener("submit",event=>{
  event.preventDefault();
  if(!cart.size){showToast("Your bag is empty");$("#cart").scrollIntoView({behavior:"smooth"});return;}
  const form = new FormData(event.currentTarget);
  const name = String(form.get("fullName")).trim();
  const entries = [...cart.values()];
  const subtotal = entries.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const delivery = subtotal >= 1500 ? 0 : 80;
  const total = subtotal+delivery;
  const orderNumber = "SK-"+Date.now().toString().slice(-7);
  const success = $("#order-success");
  success.innerHTML = `<h3>Thank you, ${escapeHTML(name)}. Your order is noted.</h3>
    <p>Sample order number: <strong>${orderNumber}</strong></p>
    <p><strong>Total: ${money(total)}</strong> · Payment: ${escapeHTML(String(form.get("payment")))}</p>
    <div class="receipt-items">${entries.map(item=>`${item.product.name} × ${item.quantity} — ${money(item.product.price*item.quantity)}`).join("<br>")}</div>
    <p class="demo-warning">This is a classroom demo. No real order or payment was sent.</p>`;
  success.hidden = false;
  success.scrollIntoView({behavior:"smooth",block:"center"});
  cart.clear();renderCart();event.currentTarget.reset();
  $("#payment-hint").textContent = "Choose your preferred payment method. Online payments are shown as demo options only.";
});
function escapeHTML(value){
  return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();

