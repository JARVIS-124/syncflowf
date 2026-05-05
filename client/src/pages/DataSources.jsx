import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';

export default function DataSources() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const fileRef = useRef();

  const load = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSources(data.map(r => ({ ...r, headers: JSON.parse(r.headers_json || '[]') })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, [user]);

  const uploadFile = async (file) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      // 1. Parse locally to get headers and row count
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      const headers = json[0] || [];
      const rowCount = Math.max(0, json.length - 1);
      
      const fileId = crypto.randomUUID();
      const filePath = `${user.id}/${fileId}-${file.name}`;

      // 2. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Storage bucket "uploads" might not exist. Pls create it in Supabase! ' + uploadError.message);
      }

      // 3. Save metadata to DB
      const { error: dbError } = await supabase.from('data_sources').insert([{
        id: fileId,
        user_id: user.id,
        name: sheetName || file.name,
        original_name: file.name,
        file_path: filePath,
        headers_json: JSON.stringify(headers),
        row_count: rowCount
      }]);

      if (dbError) throw dbError;

      await load();
      showNotification('File uploaded successfully!', 'success');
    } catch (err) {
      showNotification('Upload failed: ' + err.message, 'error');
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const viewPreview = async (source) => {
    try {
      setPreview({ name: source.name, loading: true });
      
      // Download from storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(source.file_path);
        
      if (error) throw error;
      
      const arrayBuffer = await data.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      const headers = source.headers || [];
      const rows = json.slice(0, 50); // Preview max 50 rows
      
      setPreview({
        name: source.original_name,
        preview: { headers, rows, rowCount: source.row_count }
      });
    } catch (err) {
      showNotification('Failed to preview: ' + err.message, 'error');
      setPreview(null);
    }
  };

  const deleteSource = async (id, filePath) => {
    setConfirmAction({
      title: 'Delete Data Source',
      message: 'Are you sure you want to permanently delete this data source? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await supabase.storage.from('uploads').remove([filePath]);
          await supabase.from('data_sources').delete().eq('id', id);
          setPreview(null);
          await load();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Data Sources</h1>
        <p>Upload Excel or CSV files to use as sync sources or destinations</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ marginBottom: 24 }}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => uploadFile(e.target.files[0])} />
        {uploading ? (
          <><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }}></div><p>Uploading & parsing...</p></>
        ) : (
          <>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p><strong>Click to upload</strong> or drag & drop</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Supports .xlsx, .xls, .csv (max 10MB)</p>
          </>
        )}
      </div>

      {/* File List */}
      {sources.length === 0 ? (
        <div className="empty-state">
          <h3>No data sources yet</h3>
          <p>Upload an Excel or CSV file to get started with data mapping and syncing.</p>
        </div>
      ) : (
        <div className="card-grid">
          {sources.map(ds => (
            <div key={ds.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: '1.6rem' }}>📊</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ds.original_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{ds.row_count} rows · {ds.headers?.length || 0} columns</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Columns:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(ds.headers || []).slice(0, 8).map(h => (
                    <span key={h} className="badge badge-neutral">{h}</span>
                  ))}
                  {(ds.headers || []).length > 8 && <span className="badge badge-neutral">+{ds.headers.length - 8}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => viewPreview(ds)}>Preview</button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteSource(ds.id, ds.file_path)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 1000 }}>
            <div className="modal-header">
              <h2>{preview.name} — Preview</h2>
              <button className="modal-close" onClick={() => setPreview(null)}>×</button>
            </div>
            
            {preview.loading ? (
               <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32 }}></div></div>
            ) : (
               <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr>{preview.preview.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {preview.preview.rows.map((row, i) => (
                        <tr key={i}>{preview.preview.headers.map(h => <td key={h}>{String(row[h] ?? '')}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.preview.rowCount > preview.preview.rows.length && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
                    Showing {preview.preview.rows.length} of {preview.preview.rowCount} rows
                  </p>
                )}
               </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        type={confirmAction?.type}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
        confirmText="Delete"
      />
    </div>
  );
}
