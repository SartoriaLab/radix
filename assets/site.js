// ===== Radix Radiologia Odontológica - Scripts compartilhados =====

(function(){
    // Header scroll
    var hdr = document.getElementById('header');
    if(hdr){
        window.addEventListener('scroll', function(){
            hdr.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    // Mobile menu
    var ham = document.getElementById('ham');
    var mob = document.getElementById('mob-menu');
    if(ham && mob){
        ham.addEventListener('click', function(){
            ham.classList.toggle('on');
            mob.classList.toggle('on');
            document.body.style.overflow = mob.classList.contains('on') ? 'hidden' : '';
        });
        var links = mob.querySelectorAll('a');
        for(var i = 0; i < links.length; i++){
            links[i].addEventListener('click', function(){
                ham.classList.remove('on');
                mob.classList.remove('on');
                document.body.style.overflow = '';
            });
        }
    }

    // Scroll animations
    var animEls = document.querySelectorAll('.anim');
    if(animEls.length && 'IntersectionObserver' in window){
        var obs = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(e.isIntersecting){
                    e.target.classList.add('show');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        animEls.forEach(function(el){ obs.observe(el); });
    } else {
        // Fallback: show all
        animEls.forEach(function(el){ el.classList.add('show'); });
    }

    // Cookie Banner LGPD
    var KEY = 'radix_consent_v1';
    var banner = document.getElementById('ck-banner');
    var accept = document.getElementById('ck-accept');
    var reject = document.getElementById('ck-reject');
    if(banner && accept && reject){
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch(e){}
        if(!saved){
            setTimeout(function(){ banner.classList.add('on'); }, 1200);
        }
        function save(value){
            try {
                localStorage.setItem(KEY, JSON.stringify({ value: value, ts: Date.now() }));
            } catch(e){}
            banner.classList.remove('on');
        }
        accept.addEventListener('click', function(){ save('accepted'); });
        reject.addEventListener('click', function(){ save('rejected'); });
    }
})();
