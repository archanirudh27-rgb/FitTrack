// Swap the temporary Biceps torso graphic for the uploaded production artwork.
(function(){
  const SRC='assets/muscle-groups/biceps.png';
  function img(){return `<img class="library-group-image" src="${SRC}" alt="Biceps muscles highlighted" loading="lazy">`;}
  function apply(){
    document.querySelectorAll('.library-group-card').forEach(card=>{
      const title=card.querySelector('.card-title')?.textContent?.trim().toLowerCase();
      if(title==='biceps'){
        const art=card.querySelector('.library-group-art');
        if(art && !art.querySelector('img[src*="biceps.png"]')) art.innerHTML=img();
      }
    });
    const heading=document.querySelector('.exercise-detail-head .eyebrow')?.textContent?.trim().toLowerCase();
    if(heading==='biceps exercise'){
      document.querySelectorAll('.target-muscle-art').forEach(art=>{
        if(!art.querySelector('img[src*="biceps.png"]')) art.innerHTML=img();
      });
    }
  }
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',apply);
  apply();
})();