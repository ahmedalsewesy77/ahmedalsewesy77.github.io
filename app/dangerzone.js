/* Nimara merchant danger zone: unpublish or permanently delete stores you own.
   Uses the app's own Supabase session (nim_auth) with the publishable key,
   same as the app bundle. Appears on #/dash/settings. */
(function(){
  var URL_='https://sftwjgbbijjboosoqwyo.supabase.co';
  var KEY='sb_publishable_lYACMXUQXXJKnvw6BiUcuQ_MUzQsJb_';
  function tok(){
    try{
      var raw=localStorage.getItem('nim_auth')||localStorage.getItem('sb-sftwjgbbijjboosoqwyo-auth-token');
      if(!raw)return null;
      var j=JSON.parse(raw);
      return (j&&(j.access_token||(j.currentSession&&j.currentSession.access_token)))||null;
    }catch(e){return null}
  }
  function hdrs(){
    return {'apikey':KEY,'Authorization':'Bearer '+(tok()||KEY),'Content-Type':'application/json'};
  }
  function myStores(cb){
    fetch(URL_+'/rest/v1/stores?select=id,name,slug,published&order=created_at',{headers:hdrs()})
      .then(function(r){return r.json()})
      .then(function(rows){cb(Array.isArray(rows)?null:rows,Array.isArray(rows)?rows:[])})
      .catch(function(e){cb(e)});
  }
  function render(card){
    var list=card.querySelector('#ndz-list');
    list.innerHTML='...';
    myStores(function(err,rows){
      if(err){list.innerHTML='';msg(card,'تعذر تحميل المتاجر');return}
      if(!rows.length){list.innerHTML='';msg(card,'لا توجد متاجر');return}
      list.innerHTML='';
      rows.forEach(function(st){
        var row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #fee2e2;flex-wrap:wrap';
        var nm=document.createElement('span');
        nm.style.cssText='flex:1;min-width:140px;font-size:13px;color:#450a0a';
        nm.textContent=st.name+' ('+st.slug+') — '+(st.published?'منشور':'غير منشور');
        row.appendChild(nm);
        if(st.published){
          row.appendChild(btn('إلغاء النشر','#f59e0b','#fffbeb','#92400e',function(ev){
            act(ev.target,st,'PATCH',{published:false},'تم إلغاء نشر '+st.name);
          }));
        }
        row.appendChild(btn('حذف نهائي','#ef4444','#fef2f2','#b91c1c',function(ev){
          if(!confirm('حذف "'+st.name+'" نهائيًا؟ لا يمكن التراجع.'))return;
          act(ev.target,st,'DELETE',null,'تم حذف '+st.name+' نهائيًا');
        }));
        list.appendChild(row);
      });
    });
  }
  function btn(t,bc,bg,fg,fn){
    var b=document.createElement('button');
    b.textContent=t;
    b.style.cssText='padding:6px 12px;border-radius:9px;border:1px solid '+bc+';background:'+bg+';color:'+fg+';cursor:pointer;font-family:inherit;font-size:12px';
    b.onclick=fn;
    return b;
  }
  function msg(card,t){var m=card.querySelector('#ndz-msg');if(m)m.textContent=t}
  function act(el,st,method,body,okText){
    var card=document.getElementById('ndz');
    msg(card,'...');
    fetch(URL_+'/rest/v1/stores?id=eq.'+st.id,{method:method,headers:hdrs(),body:body?JSON.stringify(body):null})
      .then(function(r){
        if(r.ok||r.status===204){msg(card,okText);setTimeout(function(){render(card)},800)}
        else r.text().then(function(){msg(card,'فشل ('+r.status+') — الصلاحيات قد تمنع العملية')});
      })
      .catch(function(){msg(card,'فشل الاتصال')});
  }
  function mount(){
    if(document.getElementById('ndz'))return;
    if(location.hash.indexOf('#/dash/settings')!==0)return;
    var heads=[].slice.call(document.querySelectorAll('h1,h2,h3'));
    var anchor=null;
    for(var i=0;i<heads.length;i++){if(heads[i].textContent.trim()==='فريق العمل'){anchor=heads[i];break}}
    if(!anchor)return;
    var host=anchor.closest('div');
    var card=document.createElement('div');
    card.id='ndz';
    card.style.cssText='margin-top:18px;padding:16px;border:1px solid #fecaca;background:#fff5f5;border-radius:14px';
    card.innerHTML='<h3 style="margin:0 0 6px;color:#b91c1c;font-size:15px">منطقة الخطر</h3>'
      +'<p style="margin:0 0 10px;color:#7f1d1d;font-size:12px">إلغاء النشر يخفي المتجر عن الزوار فورًا. الحذف النهائي لا يمكن التراجع عنه.</p>'
      +'<div id="ndz-list"></div><div id="ndz-msg" style="margin-top:8px;font-size:12px;color:#7f1d1d"></div>';
    host.parentNode.insertBefore(card,host.nextSibling);
    render(card);
  }
  setInterval(function(){mount()},1500);
})();
