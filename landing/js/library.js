(function () {
 'use strict';
 var results=document.getElementById('library-results');if(!results)return;
 var cards=Array.prototype.slice.call(results.children), search=document.getElementById('library-search'), sort=document.getElementById('library-sort'), only=document.getElementById('favorites-only'), count=document.getElementById('library-count'), status=document.getElementById('library-status'), data=[], favorites=[];
 try{var saved=JSON.parse(localStorage.getItem('alva.library.saved')||'[]');if(Array.isArray(saved))favorites=saved.filter(function(x){return typeof x==='string';});}catch(ignore){}
 function normalize(s){return s.toLocaleLowerCase('ru').replace(/ё/g,'е');}
 function saves(){document.querySelectorAll('[data-save]').forEach(function(b){var on=favorites.indexOf(b.dataset.save)>=0;b.setAttribute('aria-pressed',String(on));b.textContent=on?'★':'☆';});}
 function selected(name){return document.querySelector('input[name="'+name+'"]:checked').value;}
 function apply(){
  var topic=selected('topic'),format=selected('format'),words=normalize(search.value.trim()).split(/\s+/).filter(Boolean),shown=0;
  var order=['mirovozrenie','enio','book','dualnost','prirodnoej','neitral','razlichenie','umiurovni','vibor','ego-sist','psihich','children-1','soziolog','management-2','management-3','management-4','management-5','management-6','management-7','management-8','management-9','management-10','management-11','management-1','development-1','development-2'];
  var ordered=cards.slice();
  if(sort.value==='curated')ordered.sort(function(a,b){return order.indexOf(a.dataset.item)-order.indexOf(b.dataset.item);});
  if(sort.value==='title')ordered.sort(function(a,b){return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent,'ru');});
  if(sort.value==='short')ordered.sort(function(a,b){return (a._material&&a._material.minutes||10000)-(b._material&&b._material.minutes||10000);});
  ordered.forEach(function(card){
   var m=card._material, text=card._search||normalize(card.textContent);
   var show=(!m||(topic==='all'||m.topics.indexOf(topic)>=0)&&(format==='all'||m.format===format))&&(!only.checked||favorites.indexOf(card.dataset.item)>=0)&&words.every(function(w){return text.indexOf(w)>=0;});
   card.hidden=!show;if(show)shown++;results.appendChild(card);
  });
  var names={all:'Все материалы',worldview:'Мировоззрение',consciousness:'Сознание и мышление',children:'Воспитание детей',management:'Осознанное управление',self:'Развитие человека',society:'Общество и отношения'};document.getElementById('catalog-title').textContent=names[topic]||'Все материалы';document.getElementById('catalog-context').textContent=topic==='all'?'Материалы всех разделов. Можно уточнить поиск и формат.':'Материалы выбранного раздела. Поиск работает внутри него.';
  count.textContent='Найдено: '+shown+' из '+cards.length;document.getElementById('library-empty').hidden=shown!==0;
  var params=new URLSearchParams();if(search.value.trim())params.set('q',search.value.trim());if(topic!=='all')params.set('topic',topic);if(format!=='all')params.set('format',format);if(only.checked)params.set('saved','1');
  try{history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:'')+location.hash);}catch(ignore){}
 }
 function reset(){search.value='';document.querySelector('input[name="topic"][value="all"]').checked=true;document.querySelector('input[name="format"][value="all"]').checked=true;only.checked=false;sort.value='curated';apply();}
 var params=new URLSearchParams(location.search);search.value=params.get('q')||'';
 ['topic','format'].forEach(function(name){var value=params.get(name);document.querySelectorAll('input[name="'+name+'"]').forEach(function(input){if(input.value===value)input.checked=true;});});only.checked=params.get('saved')==='1';
 document.querySelector('.library-search').addEventListener('submit',function(e){e.preventDefault();apply();});document.querySelector('.library-search').addEventListener('reset',function(e){e.preventDefault();reset();});
 var delay;search.addEventListener('input',function(){clearTimeout(delay);delay=setTimeout(apply,120);});document.querySelector('.library-filters').addEventListener('change',apply);sort.addEventListener('change',apply);
 document.querySelectorAll('[data-route]').forEach(function(link){link.addEventListener('click',function(){reset();document.querySelector('input[name="topic"][value="'+link.dataset.route+'"]').checked=true;apply();});});
 results.addEventListener('click',function(e){var b=e.target.closest('[data-save]');if(!b)return;var id=b.dataset.save,i=favorites.indexOf(id);if(i>=0)favorites.splice(i,1);else favorites.push(id);try{localStorage.setItem('alva.library.saved',JSON.stringify(favorites));}catch(ignore){status.textContent='Браузер не разрешает сохранить избранное между посещениями.';}saves();apply();});
 results.addEventListener('click',function(e){if(e.target.closest('a')){try{sessionStorage.setItem('alva.library.return',location.pathname+location.search+'#catalog');}catch(ignore){}}});
 saves();
 fetch('data/library.json').then(function(r){if(!r.ok)throw new Error('index');return r.json();}).then(function(items){data=items;cards.forEach(function(card){var m=data.find(function(x){return x.id===card.dataset.item;});card._material=m;if(m)card._search=normalize(m.title+' '+m.description+' '+m.text+' '+m.author);});apply();}).catch(function(){status.textContent='Поиск по полному тексту временно недоступен. Можно искать по названию и описанию.';document.querySelectorAll('.library-filters input[name="topic"],.library-filters input[name="format"]').forEach(function(i){i.disabled=true;});apply();});
})();
