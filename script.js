document.addEventListener('DOMContentLoaded', function() {
  // Language translations for UI labels
  const translations = {
    ja: {
      profile: 'プロフィール',
      research: '研究の興味',
      papers: '論文',
      preprint: 'プレプリント',
      talks: '講演記録',
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

    // change summaries for top-level sections
    Object.keys(sectionMap).forEach(id => {
      const el = document.querySelector(`#${id} summary`);
      if (el) el.textContent = translations[lang][sectionMap[id]] || el.textContent;
    });

    // papers -> inner preprint summary (if present)
    const preprintSummary = document.querySelector('#papers details summary');
    if (preprintSummary) {
      // If the inner details exists, ensure its summary is the preprint label
      const inner = document.querySelector('#papers details details summary');
      if (inner) inner.textContent = translations[lang].preprint || inner.textContent;
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
  }

  // wire up language links
  langLinks.forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = a.dataset.lang;
      applyLanguage(lang);
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

  // remove legacy header click behaviour (was only for demo)
  const header = document.querySelector('header');
  header && header.replaceWith(header.cloneNode(true));
});
