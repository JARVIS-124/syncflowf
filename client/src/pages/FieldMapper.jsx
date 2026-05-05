import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';

export default function FieldMapper() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [connections, setConnections] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [savedMappings, setSavedMappings] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  const [sourceType, setSourceType] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [destType, setDestType] = useState('');
  const [destId, setDestId] = useState('');
  const [sourceFields, setSourceFields] = useState([]);
  const [destFields, setDestFields] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [mapName, setMapName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const ObjectRes = await Promise.all([
        supabase.from('connections').select('*').eq('user_id', user.id),
        supabase.from('data_sources').select('*').eq('user_id', user.id),
        supabase.from('field_mappings').select('*').eq('user_id', user.id)
      ]);
      setConnections(ObjectRes[0].data || []);
      setDataSources(ObjectRes[1].data || []);
      setSavedMappings((ObjectRes[2].data || []).map(m => ({
        ...m,
        mappings: JSON.parse(m.mappings_json || '[]')
      })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const allSources = [
    ...connections.map(c => ({ id: c.id, type: 'connection', label: c.label || c.provider, provider: c.provider, fields: JSON.parse(c.fields_json || '[]') })),
    ...dataSources.map(d => ({ id: d.id, type: 'datasource', label: d.original_name, provider: 'excel', fields: JSON.parse(d.headers_json || '[]').map(h => ({ name: h, label: h, type: 'string'})) })),
  ];

  useEffect(() => {
    if (sourceType && sourceId) {
       const s = allSources.find(s => s.type === sourceType && s.id === sourceId);
       setSourceFields(s ? s.fields : []);
    } else setSourceFields([]);
  }, [sourceType, sourceId, connections, dataSources]);

  useEffect(() => {
    if (destType && destId) {
       const s = allSources.find(s => s.type === destType && s.id === destId);
       setDestFields(s ? s.fields : []);
    } else setDestFields([]);
  }, [destType, destId, connections, dataSources]);

  const handleSourceSelect = (val) => {
    const item = allSources.find(s => `${s.type}:${s.id}` === val);
    if (item) { setSourceType(item.type); setSourceId(item.id); }
    else { setSourceType(''); setSourceId(''); }
    setPairs([]);
  };

  const handleDestSelect = (val) => {
    const item = allSources.find(s => `${s.type}:${s.id}` === val);
    if (item) { setDestType(item.type); setDestId(item.id); }
    else { setDestType(''); setDestId(''); }
    setPairs([]);
  };

  const addPair = () => {
    if (selectedSource && selectedDest) {
      if (pairs.some(p => p.sourceField === selectedSource && p.destField === selectedDest)) return;
      setPairs([...pairs, { sourceField: selectedSource, destField: selectedDest, transform: 'none' }]);
      setSelectedSource(null);
      setSelectedDest(null);
    }
  };

  const removePair = (idx) => { setPairs(pairs.filter((_, i) => i !== idx)); };

  const save = async () => {
    if (!mapName.trim() || pairs.length === 0) return showNotification('Name and at least one field mapping required', 'error');
    setSaving(true);
    try {
      const { error } = await supabase.from('field_mappings').insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        name: mapName,
        source_type: sourceType,
        source_id: sourceId,
        dest_type: destType,
        dest_id: destId,
        mappings_json: JSON.stringify(pairs)
      }]);
      if (error) throw error;
      
      const { data } = await supabase.from('field_mappings').select('*').eq('user_id', user.id);
      setSavedMappings(data.map(m => ({...m, mappings: JSON.parse(m.mappings_json || '[]')})));
      
      setMapName('');
      setPairs([]);
      showNotification('Field mapping saved!', 'success');
    } catch (err) { showNotification(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const deleteMapping = async (id) => {
    setConfirmAction({
      title: 'Delete Mapping',
      message: 'Are you sure you want to delete this field mapping?',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await supabase.from('field_mappings').delete().eq('id', id);
          const { data } = await supabase.from('field_mappings').select('*').eq('user_id', user.id);
          setSavedMappings(data ? data.map(m => ({...m, mappings: JSON.parse(m.mappings_json || '[]')})) : []);
          showNotification('Mapping deleted', 'info');
        } catch {
          showNotification('Failed to delete mapping', 'error');
        }
      }
    });
  };

  const isMappedSource = (f) => pairs.some(p => p.sourceField === f);
  const isMappedDest = (f) => pairs.some(p => p.destField === f);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Field Mapper</h1>
        <p>Map fields between your data sources — match "Company" → "Client Name" and more</p>
      </div>

      {/* Source / Dest selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="form-group">
          <label className="form-label">Source</label>
          <select className="form-select" value={`${sourceType}:${sourceId}`} onChange={e => handleSourceSelect(e.target.value)}>
            <option value="">Select source...</option>
            {allSources.map(s => <option key={`${s.type}:${s.id}`} value={`${s.type}:${s.id}`}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Destination</label>
          <select className="form-select" value={`${destType}:${destId}`} onChange={e => handleDestSelect(e.target.value)}>
            <option value="">Select destination...</option>
            {allSources.filter(s => `${s.type}:${s.id}` !== `${sourceType}:${sourceId}`).map(s => (
              <option key={`${s.type}:${s.id}`} value={`${s.type}:${s.id}`}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Mapper */}
      {sourceFields.length > 0 && destFields.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="mapper-container">
            <div className="mapper-col">
              <h3>Source Fields</h3>
              {sourceFields.map(f => (
                <div key={f.name} className={`mapper-field ${selectedSource === f.name ? 'selected' : ''} ${isMappedSource(f.name) ? 'mapped' : ''}`}
                  onClick={() => { setSelectedSource(f.name); if (selectedDest) { setPairs([...pairs, { sourceField: f.name, destField: selectedDest, transform: 'none' }]); setSelectedSource(null); setSelectedDest(null); } }}>
                  {f.label || f.name}
                  <span className="field-type">{isMappedSource(f.name) ? '✓' : f.type || 'string'}</span>
                </div>
              ))}
            </div>

            <div className="mapper-arrows">
              <button className="mapper-arrow-btn" onClick={addPair} disabled={!selectedSource || !selectedDest} title="Map selected fields">→</button>
            </div>

            <div className="mapper-col">
              <h3>Destination Fields</h3>
              {destFields.map(f => (
                <div key={f.name} className={`mapper-field ${selectedDest === f.name ? 'selected' : ''} ${isMappedDest(f.name) ? 'mapped' : ''}`}
                  onClick={() => { setSelectedDest(f.name); if (selectedSource) { setPairs([...pairs, { sourceField: selectedSource, destField: f.name, transform: 'none' }]); setSelectedSource(null); setSelectedDest(null); } }}>
                  {f.label || f.name}
                  <span className="field-type">{isMappedDest(f.name) ? '✓' : f.type || 'string'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapped Pairs */}
          {pairs.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Mapped Fields ({pairs.length})</h3>
              {pairs.map((p, i) => (
                <div key={i} className="mapping-pair">
                  <span style={{ fontWeight: 600 }}>{p.sourceField}</span>
                  <span className="arrow">→</span>
                  <span style={{ fontWeight: 600 }}>{p.destField}</span>
                  <select value={p.transform} onChange={e => { const np = [...pairs]; np[i].transform = e.target.value; setPairs(np); }}
                    style={{ marginLeft: 'auto', marginRight: 8, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    <option value="none">No transform</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="trim">Trim spaces</option>
                    <option value="number">To number</option>
                  </select>
                  <button className="remove-btn" onClick={() => removePair(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Save */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, alignItems: 'center' }}>
            <input className="form-input" placeholder="Mapping name (e.g. HubSpot → QuickBooks)" value={mapName} onChange={e => setMapName(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={save} disabled={saving || !mapName || pairs.length === 0}>
              {saving ? <span className="spinner"></span> : 'Save Mapping'}
            </button>
          </div>
        </div>
      )}

      {/* Saved Mappings */}
      {savedMappings.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Saved Mappings</h2>
          <div className="card-grid">
            {savedMappings.map(m => (
              <div key={m.id} className="card">
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{m.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {m.source_type} → {m.dest_type} · {m.mappings?.length || 0} field pairs
                </div>
                {(m.mappings || []).slice(0, 4).map((p, i) => (
                  <div key={i} className="mapping-pair" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                    <span>{p.sourceField}</span>
                    <span className="arrow">→</span>
                    <span>{p.destField}</span>
                    {p.transform !== 'none' && <span className="badge badge-info" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{p.transform}</span>}
                  </div>
                ))}
                <button className="btn btn-sm btn-danger" style={{ marginTop: 10 }} onClick={() => deleteMapping(m.id)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal 
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
        type={confirmAction?.type || 'danger'}
      />
    </div>
  );
}
