// Root application — routes between library / detail / cook / editor
const { useState, useEffect } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "clay",
  "theme": "light",
  "font": "modern",
  "density": 1,
  "viewMode": "grid"
}/*EDITMODE-END*/;

const App = () => {
  // persisted state
  const [dishes, setDishes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mk.dishes')) || window.SEED_DISHES; }
    catch { return window.SEED_DISHES; }
  });
  const [pantry, setPantry] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mk.pantry')) || window.SEED_PANTRY; }
    catch { return window.SEED_PANTRY; }
  });
  const [tweaks, setTweaks] = useState(() => {
    try { return {...DEFAULT_TWEAKS, ...JSON.parse(localStorage.getItem('mk.tweaks') || '{}')}; }
    catch { return DEFAULT_TWEAKS; }
  });
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mk.route')) || {view: 'library'}; }
    catch { return {view: 'library'}; }
  });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // persist
  useEffect(() => { localStorage.setItem('mk.dishes', JSON.stringify(dishes)); }, [dishes]);
  useEffect(() => { localStorage.setItem('mk.pantry', JSON.stringify(pantry)); }, [pantry]);
  useEffect(() => { localStorage.setItem('mk.tweaks', JSON.stringify(tweaks)); }, [tweaks]);
  useEffect(() => { localStorage.setItem('mk.route', JSON.stringify(route)); }, [route]);

  // Apply theme/accent/font/density to root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tweaks.theme);
    root.setAttribute('data-accent', tweaks.accent);
    root.setAttribute('data-font', tweaks.font);
    root.style.setProperty('--density', tweaks.density);
  }, [tweaks]);

  // Tweaks-pane wiring with host
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({type:'__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  useEffect(() => {
    if (editMode) setTweaksOpen(true);
  }, [editMode]);
  useEffect(() => {
    // persist tweak edits back to file when in edit mode
    if (!editMode) return;
    window.parent.postMessage({type:'__edit_mode_set_keys', edits: tweaks}, '*');
  }, [tweaks, editMode]);

  const toggleTag = (t) => {
    setActiveTags(prev => prev.includes(t) ? prev.filter(x => x!==t) : [...prev, t]);
  };
  const goHome = () => {
    setRoute({view: 'library'});
    setActiveCategory(null); setActiveTags([]); setSearch('');
    setDrawerOpen(false);
  };
  const openDish = (id) => { setRoute({view:'detail', id}); setDrawerOpen(false); };
  const currentDish = route.id ? dishes.find(d => d.id === route.id) : null;

  const saveDish = (dish) => {
    const exists = dishes.find(d => d.id === dish.id);
    if (exists) setDishes(dishes.map(d => d.id === dish.id ? dish : d));
    else setDishes([dish, ...dishes]);
    setRoute({view:'detail', id: dish.id});
  };
  const deleteDish = (id) => {
    if (!confirm('Delete this dish?')) return;
    setDishes(dishes.filter(d => d.id !== id));
    goHome();
  };

  const pantrySoonCount = pantry.filter(x => {
    const d = window.daysUntil(x.expires);
    return d != null && d <= 7;
  }).length;

  const sidebarProps = {
    dishes, activeCategory, route, pantrySoonCount,
    setActiveCategory: (c) => { setActiveCategory(c); setRoute({view:'library'}); setDrawerOpen(false); },
    activeTags, toggleTag, goHome,
    onOpenTweaks: () => { setTweaksOpen(true); setDrawerOpen(false); },
    onOpenPantry: () => { setRoute({view:'pantry'}); setDrawerOpen(false); },
  };

  return (
    <div className="app">
      {/* Persistent sidebar (desktop/iPad) */}
      <aside className="sidebar">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      <div className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <Sidebar {...sidebarProps} />
      </aside>

      <main className="main">
        {route.view === 'pantry' && (
          <PantryView
            pantry={pantry}
            setPantry={setPantry}
            openDrawer={() => setDrawerOpen(true)}
          />
        )}

        {route.view === 'library' && (
          <Library
            dishes={dishes}
            onOpenDish={openDish}
            onAdd={() => setRoute({view:'editor', isNew: true})}
            viewMode={tweaks.viewMode}
            setViewMode={(v) => setTweaks({...tweaks, viewMode: v})}
            search={search}
            setSearch={setSearch}
            openDrawer={() => setDrawerOpen(true)}
            activeCategory={activeCategory}
            activeTags={activeTags}
          />
        )}

        {route.view === 'detail' && currentDish && (
          <DishDetail
            dish={currentDish}
            onBack={goHome}
            onEdit={() => setRoute({view:'editor', id: currentDish.id})}
            onCook={() => setRoute({view:'cook', id: currentDish.id})}
            onDelete={() => deleteDish(currentDish.id)}
          />
        )}

        {route.view === 'editor' && (
          <Editor
            dish={route.id ? dishes.find(d => d.id === route.id) : null}
            isNew={!route.id}
            onSave={saveDish}
            onCancel={() => route.id
              ? setRoute({view:'detail', id: route.id})
              : goHome()}
          />
        )}
      </main>

      {route.view === 'cook' && currentDish && (
        <CookMode dish={currentDish} onExit={() => setRoute({view:'detail', id: currentDish.id})} />
      )}

      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
