// Root application — routes between library / detail / cook / editor
const { useState, useEffect } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "clay",
  "theme": "light",
  "font": "modern",
  "density": 1,
  "viewMode": "grid"
}/*EDITMODE-END*/;

// ── Login screen ──────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr]   = React.useState(null);

  const signIn = () => {
    setBusy(true);
    setErr(null);
    const provider = new firebase.auth.GoogleAuthProvider();
    window.auth.signInWithPopup(provider).catch(e => {
      setBusy(false);
      setErr(e.message);
    });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--paper)', padding: 32, textAlign: 'center'
    }}>
      <div style={{fontFamily: 'var(--f-display)', fontSize: 42, fontWeight: 500,
        color: 'var(--ink)', marginBottom: 8}}>
        My Kitchen
      </div>
      <div style={{fontFamily: 'var(--f-body)', fontSize: 16, color: 'var(--ink-3)',
        marginBottom: 40}}>
        Your personal cookbook — sign in to sync across all your devices.
      </div>
      <button
        onClick={signIn}
        disabled={busy}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 28px', borderRadius: 8, border: '1px solid var(--rule)',
          background: 'var(--card)', cursor: busy ? 'default' : 'pointer',
          fontFamily: 'var(--f-body)', fontSize: 15, fontWeight: 500,
          color: 'var(--ink)', opacity: busy ? 0.6 : 1
        }}>
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
          <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.4 6.3 14.7z"/>
          <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.8 37 27 38 24 38c-5.8 0-10.7-3.1-11.8-7.5l-7 5.4C9.7 43.5 16.3 46 24 46z"/>
          <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.6 2.8-2.3 5.1-4.6 6.6l6.6 5.4C41.8 37.2 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
        </svg>
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {err && (
        <div style={{marginTop: 16, fontSize: 13, color: 'var(--accent)', maxWidth: 320}}>
          {err}
        </div>
      )}
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  const [uid, setUid]               = useState(null);
  const [authReady, setAuthReady]   = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // persisted state
  const [dishes,  setDishes]  = useState([]);
  const [pantry,  setPantry]  = useState([]);
  const [tweaks,  setTweaks]  = useState(DEFAULT_TWEAKS);
  const [route,   setRoute]   = useState({view: 'library'});

  // ephemeral UI state
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTags,     setActiveTags]     = useState([]);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [tweaksOpen,     setTweaksOpen]     = useState(false);
  const [editMode,       setEditMode]       = useState(false);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    return window.auth.onAuthStateChanged(user => {
      setUid(user ? user.uid : null);
      setAuthReady(true);
      if (!user) setDataLoaded(false);
    });
  }, []);

  // ── Load data from Firestore once on login ─────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    setDataLoaded(false);
    Promise.all([
      window.db.doc('users/' + uid + '/dishes').get(),
      window.db.doc('users/' + uid + '/pantry').get(),
      window.db.doc('users/' + uid + '/tweaks').get(),
      window.db.doc('users/' + uid + '/route').get(),
    ]).then(function([dishSnap, pantrySnap, tweaksSnap, routeSnap]) {
      setDishes(dishSnap.exists   ? dishSnap.data().items   : window.SEED_DISHES);
      setPantry(pantrySnap.exists ? pantrySnap.data().items : window.SEED_PANTRY);
      setTweaks(tweaksSnap.exists ? {...DEFAULT_TWEAKS, ...tweaksSnap.data()} : DEFAULT_TWEAKS);
      setRoute(routeSnap.exists   ? routeSnap.data()        : {view: 'library'});
      setDataLoaded(true);
    }).catch(function(err) {
      console.error('Firestore load failed:', err);
      setDishes(window.SEED_DISHES);
      setPantry(window.SEED_PANTRY);
      setTweaks(DEFAULT_TWEAKS);
      setRoute({view: 'library'});
      setDataLoaded(true);
    });
  }, [uid]);

  // ── Persist to Firestore when state changes (after initial load) ───────────
  useEffect(() => {
    if (!uid || !dataLoaded) return;
    window.db.doc('users/' + uid + '/dishes').set({ items: dishes })
      .catch(err => console.error('Failed to save dishes:', err));
  }, [dishes, uid, dataLoaded]);

  useEffect(() => {
    if (!uid || !dataLoaded) return;
    window.db.doc('users/' + uid + '/pantry').set({ items: pantry })
      .catch(err => console.error('Failed to save pantry:', err));
  }, [pantry, uid, dataLoaded]);

  useEffect(() => {
    if (!uid || !dataLoaded) return;
    window.db.doc('users/' + uid + '/tweaks').set(tweaks)
      .catch(err => console.error('Failed to save tweaks:', err));
  }, [tweaks, uid, dataLoaded]);

  useEffect(() => {
    if (!uid || !dataLoaded) return;
    window.db.doc('users/' + uid + '/route').set(route)
      .catch(err => console.error('Failed to save route:', err));
  }, [route, uid, dataLoaded]);

  // ── Apply theme / accent / font / density to root ─────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme',  tweaks.theme);
    root.setAttribute('data-accent', tweaks.accent);
    root.setAttribute('data-font',   tweaks.font);
    root.style.setProperty('--density', tweaks.density);
  }, [tweaks]);

  // ── Tweaks-pane wiring with host ───────────────────────────────────────────
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({type: '__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  useEffect(() => { if (editMode) setTweaksOpen(true); }, [editMode]);
  useEffect(() => {
    if (!editMode) return;
    window.parent.postMessage({type: '__edit_mode_set_keys', edits: tweaks}, '*');
  }, [tweaks, editMode]);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const toggleTag = (t) => {
    setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };
  const goHome = () => {
    setRoute({view: 'library'});
    setActiveCategory(null); setActiveTags([]); setSearch('');
    setDrawerOpen(false);
  };
  const openDish = (id) => { setRoute({view: 'detail', id}); setDrawerOpen(false); };
  const currentDish = route.id ? dishes.find(d => d.id === route.id) : null;

  const saveDish = (dish) => {
    const exists = dishes.find(d => d.id === dish.id);
    if (exists) setDishes(dishes.map(d => d.id === dish.id ? dish : d));
    else setDishes([dish, ...dishes]);
    setRoute({view: 'detail', id: dish.id});
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
    setActiveCategory: (c) => { setActiveCategory(c); setRoute({view: 'library'}); setDrawerOpen(false); },
    activeTags, toggleTag, goHome,
    onOpenTweaks: () => { setTweaksOpen(true); setDrawerOpen(false); },
    onOpenPantry: () => { setRoute({view: 'pantry'}); setDrawerOpen(false); },
  };

  // ── Sign-out button (top-right corner) ────────────────────────────────────
  const SignOutBtn = () => (
    <button
      onClick={() => window.auth.signOut()}
      title="Sign out"
      style={{
        position: 'fixed', top: 12, right: 12, zIndex: 9999,
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-4)',
        padding: '4px 8px', borderRadius: 6
      }}>
      sign out
    </button>
  );

  // ── Gate: auth not ready yet ───────────────────────────────────────────────
  if (!authReady) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', background:'var(--paper)'}}>
        <div style={{fontFamily:'var(--f-mono)', fontSize:13, color:'var(--ink-4)'}}>
          Loading…
        </div>
      </div>
    );
  }

  // ── Gate: not signed in ────────────────────────────────────────────────────
  if (!uid) return <LoginScreen />;

  // ── Gate: signed in but data loading ──────────────────────────────────────
  if (!dataLoaded) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', background:'var(--paper)'}}>
        <div style={{fontFamily:'var(--f-mono)', fontSize:13, color:'var(--ink-4)'}}>
          Loading your kitchen…
        </div>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <SignOutBtn />

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
            onAdd={() => setRoute({view: 'editor', isNew: true})}
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
            onEdit={() => setRoute({view: 'editor', id: currentDish.id})}
            onCook={() => setRoute({view: 'cook', id: currentDish.id})}
            onDelete={() => deleteDish(currentDish.id)}
          />
        )}

        {route.view === 'editor' && (
          <Editor
            dish={route.id ? dishes.find(d => d.id === route.id) : null}
            isNew={!route.id}
            uid={uid}
            onSave={saveDish}
            onCancel={() => route.id
              ? setRoute({view: 'detail', id: route.id})
              : goHome()}
          />
        )}
      </main>

      {route.view === 'cook' && currentDish && (
        <CookMode dish={currentDish} onExit={() => setRoute({view: 'detail', id: currentDish.id})} />
      )}

      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
