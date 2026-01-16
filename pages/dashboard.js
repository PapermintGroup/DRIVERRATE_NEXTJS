import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Dashboard(){
  const [userDrivers, setUserDrivers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [name, setName] = useState(''); 
  const [company, setCompany] = useState(''); 
  const [areas, setAreas] = useState(''); 
  const [photo, setPhoto] = useState('');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [routes, setRoutes] = useState('');
  
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Updated to handle arrays for multiple pictures
  const [vehiclePics, setVehiclePics] = useState([]); // Array of strings
  const [idPic, setIdPic] = useState('');

  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (!data.ok) return router.push("/login");
        if (data.user.role !== "admin") return router.push("/");

        setUser(data.user);

        const drvRes = await fetch('/api/drivers');
        const drvData = await drvRes.json();
        setUserDrivers(drvData.drivers || []); 

        const usersRes = await fetch('/api/admin/users'); 
        const usersData = await usersRes.json();
        setAllUsers(usersData.users || []);
      } catch (err) {
        router.push("/login");
      }
    }
    loadData();
  }, []);

  // Updated to handle multiple file uploads
  const handleMultipleFileUploads = async (e, setterFunc, currentFiles = []) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (currentFiles.length + files.length > 6) {
      alert("Maximum 6 vehicle pictures allowed");
      return;
    }

    setUploading(true);
    const newUrls = [...currentFiles];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          newUrls.push(data.url);
        }
      }
      setterFunc(newUrls);
    } catch (err) {
      alert("Error uploading one or more files");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e, setterFunc) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setterFunc(data.url);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  async function create(e){
    e.preventDefault();
    const body = { 
      name, 
      companyName: company || '', 
      serviceAreas: areas || '', 
      profilePhoto: photo || '',
      email: email || '',
      phone: phone || '',
      routes: routes || '',
      facebook: facebook || '',
      instagram: instagram || '',
      twitter: twitter || '',
      whatsapp: whatsapp || '',
      // Join array into a string for database storage
      vehiclePics: vehiclePics.length > 0 ? JSON.stringify(vehiclePics) : null,
      idPic: idPic || null
    };
    
    const res = await fetch('/api/drivers/create', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    
    const j = await res.json();
    if(j.ok){ 
      alert('Driver profile created successfully!'); 
      window.location.reload(); 
    } else {
      alert(j.error || 'Error creating profile');
    }
  }

  async function toggleSubscription(userId, currentStatus) {
    const res = await fetch('/api/admin/activate-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: !currentStatus })
    });
    if(res.ok) {
      setAllUsers(allUsers.map(u => u.id === userId ? {
        ...u, 
        isSubscribed: !currentStatus,
        paymentRequested: false 
      } : u));
    }
  }

  async function rejectPayment(userId) {
    if(!confirm("Are you sure you want to reject this proof? The user will need to upload it again.")) return;
    const res = await fetch('/api/admin/reject-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if(res.ok) {
      setAllUsers(allUsers.map(u => u.id === userId ? {
        ...u, 
        paymentRequested: false,
        popUrl: null 
      } : u));
      alert("Payment request rejected and cleared.");
    }
  }

  function startEdit(driver) {
    setEditingId(driver.id);
    let parsedPics = [];
    try {
      parsedPics = driver.vehiclePics ? JSON.parse(driver.vehiclePics) : [];
      if(!Array.isArray(parsedPics)) parsedPics = [driver.vehiclePics];
    } catch (e) {
      parsedPics = driver.vehiclePics ? [driver.vehiclePics] : [];
    }
    setEditData({ 
        ...driver, 
        name: driver.name || '',
        companyName: driver.companyName || '',
        email: driver.email || '',
        phone: driver.phone || '',
        serviceAreas: driver.serviceAreas || '',
        facebook: driver.facebook || '',
        instagram: driver.instagram || '',
        vehiclePics: parsedPics 
    });
  }

  async function saveEdit() {
    const body = {
      ...editData,
      vehiclePics: JSON.stringify(editData.vehiclePics)
    };

    const res = await fetch('/api/drivers/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const j = await res.json();
    if (j.ok) {
      setUserDrivers(userDrivers.map(d => d.id === editingId ? j.driver : d));
      setEditingId(null);
      alert("Updated successfully");
    } else {
      alert(j.error || 'Error updating');
    }
  }

  async function deleteProfile(id) {
    if (!id) return alert("Driver ID missing");
    if (!confirm("Are you sure you want to delete this profile?")) return;
    
    const res = await fetch('/api/drivers/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    const j = await res.json();
    if (j.ok) {
      setUserDrivers(userDrivers.filter(d => d.id !== id));
    } else {
      alert(j.error || 'Error deleting');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if(!user) return <div style={{padding: 50, textAlign: 'center'}}>Loading session...</div>;

  return (
    <div style={{maxWidth: 900, margin: '24px auto', padding: 16, fontFamily: 'Arial, sans-serif'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2 style={{color: '#2d9a4a'}}>Admin Dashboard</h2>
        <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
          <span style={{fontSize: 14}}>Role: <b>{user.role}</b></span>
          <button onClick={logout} style={{background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer'}}>Logout</button>
        </div>
      </div>
      
      <section style={{marginTop: 20, background: '#fff5f5', padding: 20, borderRadius: 10, border: '2px solid #feb2b2', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
           <h3 style={{margin: 0, color: '#9b2c2c'}}>Payment Notification Portal</h3>
           <div style={{background: '#9b2c2c', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold'}}>
             {allUsers.filter(u => u.paymentRequested && !u.isSubscribed).length} Pending Alerts
           </div>
        </div>
        
        <p style={{fontSize: 13, color: '#4a5568', marginBottom: 15}}>The list below shows users who have notified the system of a manual EFT payment.</p>
        
        <div style={{maxHeight: 300, overflowY: 'auto', background: '#fff', borderRadius: 8, border: '1px solid #fed7d7'}}>
          {allUsers.filter(u => u.role !== 'admin').length === 0 ? (
            <p style={{padding: 20, textAlign: 'center', color: '#a0aec0'}}>No users found.</p>
          ) : (
            allUsers.filter(u => u.role !== 'admin').map(u => (
              <div key={u.id} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #fed7d7', alignItems: 'center'}}>
                <div style={{fontSize: 14}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <b style={{color: '#2d3748'}}>{u.name}</b> 
                    {u.paymentRequested && !u.isSubscribed && (
                      <span style={{background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold', border: '1px solid #f59e0b'}}>
                        ⚠️ NOTIFIED PAID
                      </span>
                    )}
                  </div>
                  <div style={{fontSize: 12, color: '#718096'}}>{u.email}</div>
                  {/* POP Display Section */}
                  {u.popUrl && (
                    <div style={{marginTop: 6}}>
                       <a href={u.popUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: 11, color: '#2d9a4a', fontWeight: 'bold', textDecoration: 'underline'}}>
                         📄 View Proof of Payment (POP)
                       </a>
                    </div>
                  )}
                  <div style={{fontSize: 11, marginTop: 4, fontWeight: 'bold', color: u.isSubscribed ? '#2d9a4a' : '#e53e3e'}}>
                    Status: {u.isSubscribed ? '✅ Active Member' : '❌ Access Restricted'}
                  </div>
                </div>
                <div style={{display: 'flex', gap: 10}}>
                  {u.paymentRequested && !u.isSubscribed && (
                    <button 
                      onClick={() => rejectPayment(u.id)}
                      style={{
                        background: '#fff',
                        color: '#e53e3e',
                        border: '1px solid #e53e3e',
                        padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold'
                      }}
                    >
                      Reject POP
                    </button>
                  )}
                  <button 
                    onClick={() => toggleSubscription(u.id, u.isSubscribed)}
                    style={{
                      background: u.isSubscribed ? '#edf2f7' : '#2d9a4a',
                      color: u.isSubscribed ? '#4a5568' : '#fff', 
                      border: u.isSubscribed ? '1px solid #cbd5e0' : 'none', 
                      padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold'
                    }}
                  >
                    {u.isSubscribed ? 'Revoke Access' : 'Approve EFT'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <form onSubmit={create} style={{display: 'grid', gap: 10, marginTop: 40, background: '#f0fdf4', padding: 20, borderRadius: 10, border: '1px solid #dcfce7'}}>
        <h4 style={{margin: 0, color: '#166534'}}>Add New Driver Listing</h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
          <input placeholder="Driver Full Name" value={name || ''} onChange={e=>setName(e.target.value)} style={inputStyle} required/>
          <input placeholder="Company Name (optional)" value={company || ''} onChange={e=>setCompany(e.target.value)} style={inputStyle}/>
          <input placeholder="Driver Email" value={email || ''} onChange={e=>setEmail(e.target.value)} style={inputStyle}/>
          <input placeholder="Phone Number" value={phone || ''} onChange={e=>setPhone(e.target.value)} style={inputStyle}/>
        </div>
        
        <input placeholder="Service Areas (e.g. Durban North, Umhlanga)" value={areas || ''} onChange={e=>setAreas(e.target.value)} style={inputStyle}/>
        <input placeholder="Main Routes Description" value={routes || ''} onChange={e=>setRoutes(e.target.value)} style={inputStyle}/>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
          <input placeholder="Facebook URL" value={facebook || ''} onChange={e=>setFacebook(e.target.value)} style={inputStyle}/>
          <input placeholder="Instagram URL" value={instagram || ''} onChange={e=>setInstagram(e.target.value)} style={inputStyle}/>
          <input placeholder="Twitter/X URL" value={twitter || ''} onChange={e=>setTwitter(e.target.value)} style={inputStyle}/>
          <input placeholder="WhatsApp Number" value={whatsapp || ''} onChange={e=>setWhatsapp(e.target.value)} style={inputStyle}/>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10}}>
          <div style={uploadBox}>
            <label style={uploadLabel}>Profile Photo</label>
            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setPhoto)} />
            {photo && <span style={{color: 'green', fontSize: 10}}>✓ Ready</span>}
          </div>
          <div style={uploadBox}>
            <label style={uploadLabel}>Vehicle Photos (Max 6)</label>
            <input type="file" accept="image/*" multiple onChange={e => handleMultipleFileUploads(e, setVehiclePics, vehiclePics)} />
            <span style={{fontSize: 10, color: '#666'}}>{vehiclePics.length}/6 uploaded</span>
            {vehiclePics.length > 0 && (
              <button type="button" onClick={() => setVehiclePics([])} style={{fontSize: 9, background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>Clear all</button>
            )}
          </div>
          <div style={uploadBox}>
            <label style={uploadLabel}>ID Document</label>
            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setIdPic)} />
            {idPic && <span style={{color: 'green', fontSize: 10}}>✓ Ready</span>}
          </div>
        </div>

        <button disabled={uploading} style={btnStyle}>
            {uploading ? "Processing Images..." : "Create Listing"}
        </button>
      </form>

      <section style={{marginTop: 32}}>
        <h3 style={{borderBottom: '2px solid #2d9a4a', paddingBottom: 8}}>Registered Drivers ({userDrivers.length})</h3>
        {userDrivers.map(d=>(
          <div key={d.id} style={{border: '1px solid #eee', padding: 15, borderRadius: 8, marginBottom: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: '#fff'}}>
            {editingId === d.id ? (
              <div style={{display: 'grid', gap: 8}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                  <input placeholder="Full Name" value={editData.name || ''} onChange={e=>setEditData({...editData, name: e.target.value})} style={inputStyle}/>
                  <input placeholder="Company Name" value={editData.companyName || ''} onChange={e=>setEditData({...editData, companyName: e.target.value})} style={inputStyle}/>
                  <input placeholder="Email" value={editData.email || ''} onChange={e=>setEditData({...editData, email: e.target.value})} style={inputStyle}/>
                  <input placeholder="Phone" value={editData.phone || ''} onChange={e=>setEditData({...editData, phone: e.target.value})} style={inputStyle}/>
                </div>
                <input placeholder="Service Areas" value={editData.serviceAreas || ''} onChange={e=>setEditData({...editData, serviceAreas: e.target.value})} style={inputStyle}/>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                  <input placeholder="Facebook" value={editData.facebook || ''} onChange={e=>setEditData({...editData, facebook: e.target.value})} style={inputStyle}/>
                  <input placeholder="Instagram" value={editData.instagram || ''} onChange={e=>setEditData({...editData, instagram: e.target.value})} style={inputStyle}/>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10}}>
                  <div style={uploadBox}>
                      <label style={uploadLabel}>Update Profile Photo</label>
                      <input type="file" onChange={e => handleFileUpload(e, (url) => setEditData({...editData, profilePhoto: url}))} />
                  </div>
                  
                  <div style={uploadBox}>
                      <label style={uploadLabel}>Update Vehicle Photos (Max 6)</label>
                      
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
                        {editData.vehiclePics && editData.vehiclePics.map((pic, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '40px', height: '40px' }}>
                            <img src={pic} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                            <button 
                              onClick={() => {
                                const filtered = editData.vehiclePics.filter((_, i) => i !== idx);
                                setEditData({...editData, vehiclePics: filtered});
                              }}
                              style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '10px', cursor: 'pointer' }}
                            >✕</button>
                          </div>
                        ))}
                      </div>

                      <input type="file" multiple onChange={e => handleMultipleFileUploads(e, (urls) => setEditData({...editData, vehiclePics: urls}), editData.vehiclePics)} />
                      <span style={{fontSize: 10}}>{editData.vehiclePics?.length || 0}/6 pics</span>
                  </div>

                  <div style={uploadBox}>
                      <label style={uploadLabel}>Update ID Document</label>
                      <input type="file" onChange={e => handleFileUpload(e, (url) => setEditData({...editData, idPic: url}))} />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                  <button onClick={saveEdit} style={{background: '#2d9a4a', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer'}}>Save</button>
                  <button onClick={()=>setEditingId(null)} style={{background: '#6b7280', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer'}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
                  <img src={d.profilePhoto || '/default-avatar.png'} style={{width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', background: '#eee'}} />
                  <div>
                    <strong style={{fontSize: 18}}>{d.name}</strong> 
                    <div style={{fontSize: 14, color: '#4b5563'}}>{d.companyName || 'Independent'}</div>
                    <div style={{fontSize: 12, color: '#6b7280'}}>📍 {d.serviceAreas || 'No areas'}</div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: 10}}>
                  <button onClick={()=>startEdit(d)} style={{background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer'}}>Edit</button>
                  <button onClick={()=>deleteProfile(d.id)} style={{background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer'}}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' };
const btnStyle = { background: '#2d9a4a', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const uploadBox = { background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '5px' };
const uploadLabel = { fontSize: '12px', fontWeight: 'bold', color: '#166534' };