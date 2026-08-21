// FitTrack realistic muscle-group artwork enhancer.
(function(){
  const art={
    chest:'assets/muscle-groups/chest.png',
    back:'assets/muscle-groups/back.png',
    shoulders:'assets/muscle-groups/shoulders.png',
    biceps:'assets/muscle-groups/biceps.png',
    triceps:'assets/muscle-groups/triceps.png',
    forearms:'assets/muscle-groups/forearms.png',
    quads:'assets/muscle-groups/quads.png',
    hamstrings:'assets/muscle-groups/hamstrings.png',
    glutes:'assets/muscle-groups/glutes.png',
    calves:'assets/muscle-groups/calves.png'
  };
  function img(src,label){return `<img class="library-group-image" src="${src}" alt="${label} muscles highlighted" loading="lazy">`}
  function apply(){
    document.querySelectorAll('.library-group-card[data-library-group-name]').forEach(card=>{
      const name=String(card.dataset.libraryGroupName||'').toLowerCase().trim();const src=art[name];const target=card.querySelector('.library-group-art');
      if(src&&target&&target.dataset.realisticArt!==src){target.innerHTML=img(src,name);target.dataset.realisticArt=src;}
    });
    const primary=[...document.querySelectorAll('.chip.accent')].find(el=>/^Primary\s*·/i.test(el.textContent||''));
    const name=primary?.textContent?.split('·')[1]?.trim()?.toLowerCase();const src=art[name];const target=document.querySelector('.target-muscle-art');
    if(src&&target&&target.dataset.realisticArt!==src){target.innerHTML=img(src,name);target.dataset.realisticArt=src;}
  }
  const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',apply);apply();
})();