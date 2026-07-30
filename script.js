document.addEventListener('DOMContentLoaded', function() {
  // Language translations for UI labels
  const translations = {
    ja: {
      profile: 'プロフィール',
      research: '研究の興味',
      papers: '論文',
      preprint: 'プレプリント',
      talks: '講演記録',
      otherMaterials: 'その他資料',
      cv: '履歴',
      collaborators: '共同研究者',
      sitemap: 'サイトマップ',
      lastUpdatedLabel: '最終更新'
    },
    en: {
      profile: 'Profile',
      research: 'Research Interests',
      papers: 'Papers',
      preprint: 'Preprints',
      talks: 'Talks',
      otherMaterials: 'Other materials',
      cv: 'CV',
      collaborators: 'Collaborators',
      sitemap: 'Sitemap',
      lastUpdatedLabel: 'Last updated'
    },
    zh: {
      profile: '个人简介',
      research: '研究兴趣',
      papers: '论文',
      preprint: '预印本',
      talks: '演讲记录',
      otherMaterials: '其他资料',
      cv: '履历',
      collaborators: '合作者',
      sitemap: '网站地图',
      lastUpdatedLabel: '最后更新'
    }
  };

  // map section ids to translation keys
  const sectionMap = {
    profile: 'profile',
    research: 'research',
    papers: 'papers',
    talks: 'talks',
    'other-materials': 'otherMaterials',
    cv: 'cv',
    collaborators: 'collaborators'
  };

  const langLinks = document.querySelectorAll('.lang-switch .lang');
  function setActiveLangLink(lang) {
    langLinks.forEach(a => a.classList.toggle('active', a.dataset.lang === lang));
  }

  function applyLanguage(lang) {
    // set html lang attribute
    document.documentElement.lang = (lang === 'zh') ? 'zh' : (lang === 'en' ? 'en' : 'ja');

    // change summaries / headings for top-level sections
    Object.keys(sectionMap).forEach(id => {
      // prefer <summary> (collapsible) but fall back to an explicit heading with .section-title
      let el = document.querySelector(`#${id} summary`);
      if (!el) el = document.querySelector(`#${id} .section-title`);
      if (el) el.textContent = translations[lang][sectionMap[id]] || el.textContent;
    });

    // papers -> inner preprint summary (if present)
    const preprintSummary = document.querySelector('#papers details details summary');
    if (preprintSummary) {
      preprintSummary.textContent = translations[lang].preprint || preprintSummary.textContent;
    }


    // sitemap title
    const sitemapHeading = document.querySelector('.sitemap h3');
    if (sitemapHeading) sitemapHeading.textContent = translations[lang].sitemap || sitemapHeading.textContent;

    // sitemap links: update text but keep href
    const sitemapLinks = document.querySelectorAll('.sitemap a');
    sitemapLinks.forEach(a => {
      const target = a.getAttribute('href').replace('#', '');
      if (sectionMap[target]) a.textContent = translations[lang][sectionMap[target]] || a.textContent;
    });

    // last-updated label prefix
    const lastUpdatedEl = document.querySelector('.last-updated');
    if (lastUpdatedEl) {
      const label = translations[lang].lastUpdatedLabel || translations.ja.lastUpdatedLabel;
      // keep the date span as-is, replace label portion
      const span = document.querySelector('#last-updated');
      if (span) lastUpdatedEl.firstChild && (lastUpdatedEl.childNodes[0].nodeValue = label + ': ');
    }

    setActiveLangLink(lang);
    localStorage.setItem('site-lang', lang);
    // Do not call updateLastUpdated() here because lastUpdatedSpan may not be initialized yet.
  }

  // wire up language links
  langLinks.forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = a.dataset.lang;
      applyLanguage(lang);
      // update the formatted last-updated date after changing language (safe at interaction time)
      if (typeof updateLastUpdated === 'function') {
        try { updateLastUpdated(); } catch (err) { /* ignore if something unexpected */ }
      }
    });
  });

  // initialize language from storage or navigator
  const savedLang = localStorage.getItem('site-lang');
  const navLang = (navigator.language || navigator.userLanguage || 'ja').slice(0,2);
  const initial = savedLang || (['ja','en','zh'].includes(navLang) ? navLang : 'ja');
  applyLanguage(initial);

  // display last modified time in footer (formatted)
  function formatLastModified(lang) {
    // document.lastModified can be an empty string in some hosting setups; fallback to now
    const raw = document.lastModified || new Date().toISOString();
    const d = new Date(raw);
    try {
      return d.toLocaleString((lang === 'zh') ? 'zh-CN' : (lang === 'en' ? 'en-US' : 'ja-JP'), { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return d.toISOString().split('T')[0];
    }
  }

  const lastUpdatedSpan = document.getElementById('last-updated');
  function updateLastUpdated() {
    const lang = localStorage.getItem('site-lang') || initial;
    if (lastUpdatedSpan) lastUpdatedSpan.textContent = formatLastModified(lang);
  }
  updateLastUpdated();

  // update last-updated when language changes as well (listen to storage events in multi-tab)
  window.addEventListener('storage', function(e) {
    if (e.key === 'site-lang') {
      updateLastUpdated();
    }
  });

  // Open <details> elements that correspond to a hash target so linked content is visible
  function openDetailsForHash(hash) {
    if (!hash) return;
    const id = hash.replace('#', '');
    // try to find a details inside the section with this id
    const details = document.querySelector(`#${id} details`);
    if (details) {
      details.open = true;
      // If there are nested details and the hash points to a nested element, open those too
      const nested = document.querySelectorAll(`#${id} details details`);
      nested.forEach(d => (d.open = true));
      // scroll the section into view
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // fallback: if the hash points to an element directly, scroll to it
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // handle hash on load
  if (location.hash) {
    // small timeout to allow browser to render details elements
    setTimeout(() => openDetailsForHash(location.hash), 50);
  }

  // respond to future hash changes
  window.addEventListener('hashchange', function() {
    openDetailsForHash(location.hash);
  });

  // Make sitemap links explicitly open matching details and update the hash without relying on default scrolling-only behavior
  const sitemapLinks = document.querySelectorAll('.sitemap a');
  sitemapLinks.forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (!href) return;
      // update history so the hash appears in URL
      history.pushState(null, '', href);
      openDetailsForHash(href);
    });
  });

  // remove legacy header click behaviour (was only for demo)
  const header = document.querySelector('header');
  header && header.replaceWith(header.cloneNode(true));
});
