const wa="6285150902707";
const msg="Halo kakak aku mau pesen dong.....";
const waUrl=`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;

document.querySelector('.menu-toggle').addEventListener('click',()=>{
  const nav=document.getElementById('navMenu');
  const open=nav.classList.toggle('open');
  nav.style.display=open?'flex':'none';
  if(open){nav.style.position='absolute';nav.style.top='78px';nav.style.left='0';nav.style.right='0';nav.style.padding='22px 7vw';nav.style.background='var(--ivory)';nav.style.flexDirection='column';nav.style.gap='18px';}
});

document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter=btn.dataset.filter;
    document.querySelectorAll('.card').forEach(card=>{
      card.style.display=(filter==='all'||card.dataset.category===filter)?'block':'none';
    });
  });
});

document.querySelectorAll('.add-order').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.dataset.item;
    const custom=`Halo kakak aku mau pesen dong.....%0A%0A${encodeURIComponent(item)}`;
    const toast=document.getElementById('toast');
    toast.textContent=`${item} dipilih! Mengarahkan ke WhatsApp…`;
    toast.classList.add('show');
    setTimeout(()=>{window.open(`https://wa.me/${wa}?text=${custom}`,'_blank');toast.classList.remove('show')},650);
  });
});

document.querySelectorAll('a[href="#menu"],a[href="#about"],a[href="#promo"],a[href="#contact"],a[href="#home"]').forEach(a=>{
  a.addEventListener('click',()=>{const nav=document.getElementById('navMenu');nav.classList.remove('open');if(window.innerWidth<=900)nav.style.display='none';});
});

document.querySelector('.wa-float').href=waUrl;
