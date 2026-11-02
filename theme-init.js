// Tema ilk boyamadan önce uygulanır (yanıp sönmeyi önler). Harici dosyadır; böylece CSP satır içi betik gerektirmez.
try{var t=localStorage.getItem('dersoyun.theme');if(t==='gece'||t==='grafit'||t==='acik')document.documentElement.dataset.theme=t;}catch(e){}
