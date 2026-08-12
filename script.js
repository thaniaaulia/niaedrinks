const toggle=document.querySelector('.menu-toggle'), links=document.querySelector('.nav-links');
toggle?.addEventListener('click',()=>links.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
const filters=document.querySelectorAll('.filter'), cards=document.querySelectorAll('.drink-card');
filters.forEach(btn=>btn.addEventListener('click',()=>{
  filters.forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  const f=btn.dataset.filter;
  cards.forEach(card=>card.style.display=(f==='all'||card.dataset.category===f)?'block':'none');
}));
