/* Nimara merchant danger zone: unpublish or permanently delete the active store.
   Uses the app's own Supabase session (no secrets here; publishable key only,
   same as the app bundle). Appears on #/dash/settings. */
(function(){
  var URL_='https://sftwjgbbijjboosoqwyo.supabase.co';
  var KEY='sb_publishable_lYACMXUQXXJKnvw6BiUcuQ_MUzQsJb_';
  var PROF={'Accept-Profile':'myschema','Content-Profile':'myschema'};
  function tok(){
    try{
      var raw=localStorage.getItem('sb-sftwjgbbijjboosoqwyo-auth-token');
      if(!raw)return null;
      var j=JSON.parse(raw);
      return (j&&(j.access_token||(j.currentSession&&j.currentSession.access_token)))||null;
    }catch(e){return null}
  }
  function hdrs(){
    var h={'apikey':KEY,'Authorization':'Bearer '+(tok()||KEY),'Content-Type':'application/json'};
    for(var k in PROF)h[k]=PROF[k];
    return h;
  }
  function activeStoreName(){
    var sels=document.querySelectorAll('select');
    for(var i=0;i<sels.length;i++){
      var o=sels[i].selectedOptions;
      if(o&&o.length&&sels[i].closest('.dside,.dbody,body'))return o[0].textContent.trim();
    }
    return null;
  }
  function findStore(cb){
    fetch(URL_+'/rest/v1/stores?select=id,name,slug,published',{headers:hdrs()})
      .then(function(r){return r.json()})
      .then(function(rows){
        if(!Array.isArray(rows))return cb(rows);
        var nm=activeStoreName();
        var st=null;
        for(var i=0;i<rows.length;i++)if(rows[i].name===nm){st=rows[i];break}
        cb(null,st||rows[0],rows);
      })
      .catch(function(e){cb(e)});
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
      +'<p style="margin:0 0 10px;color:#7f1d1d;font-size:12px">إلغاء النشر يخفي متجرك عن الزوار فورًا. الحذف النهائي يزيل المتجر ومنتجاته ولا يمكن التراجع عنه.</p>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<button id="ndz-unpub" style="padding:8px 14px;border-radius:10px;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;cursor:pointer;font-family:inherit">إلغاء نشر المتجر</button>'
      +'<button id="ndz-del" style="padding:8px 14px;border-radius:10px;border:1px solid #ef4444;background:#fef2f2;color:#b91c1c;cursor:pointer;font-family:inherit">حذف المتجر نهائيًا</button>'
      +'</div><div id="ndz-msg" style="margin-top:8px;font-size:12px;color:#7f1d1d"></div>';
    host.parentNode.insertBefore(card,host.nextSibling);
    var msg=function(t){document.getElementById('ndz-msg').textContent=t};
    document.getElementById('ndz-unpub').onclick=function(){
      msg('...');
      findStore(function(err,st){
        if(err||!st)return msg('تعذر تحديد المتجر');
        fetch(URL_+'/rest/v1/stores?id=eq.'+st.id,{method:'PATCH',headers:hdrs(),body:JSON.stringify({published:false})})
          .then(function(r){
            if(r.ok||r.status===204){msg('تم إلغاء النشر: '+st.name+' — أعد تحميل الصفحة');setTimeout(function(){location.reload()},1200)}
            else r.text().then(function(t){msg('فشل إلغاء النشر ('+r.status+')')});
          })
          .catch(function(){msg('فشل الاتصال')});
      });
    };
    document.getElementById('ndz-del').onclick=function(){
      findStore(function(err,st){
        if(err||!st)return msg('تعذر تحديد المتجر');
        if(!confirm('حذف "'+st.name+'" نهائيًا؟ لا يمكن التراجع.'))return;
        msg('...');
        fetch(URL_+'/rest/v1/stores?id=eq.'+st.id,{method:'DELETE',headers:hdrs()})
          .then(function(r){
            if(r.ok||r.status===204){msg('تم حذف المتجر نهائيًا — أعد تحميل الصفحة');setTimeout(function(){location.reload()},1200)}
            else r.text().then(function(t){msg('فشل الحذف ('+r.status+'): الصلاحيات قد تمنع الحذف — جرّب إلغاء النشر')});
          })
          .catch(function(){msg('فشل الاتصال')});
      });
    };
  }
  var t=0;
  setInterval(function(){mount()},1500);
})();
