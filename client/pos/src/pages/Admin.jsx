import { useState } from 'react';
export default function Admin({ token, api, onError, onNotice }) {
  const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();try{setLoading(true);await api.createCashier(token,{username,password});setUsername('');setPassword('');onNotice('Cashier account created successfully.');}catch(err){onError(err.message);}finally{setLoading(false);}};
  return <div className="workspace"><div className="section-intro"><div><p className="eyebrow">Administration</p><h2>Cashier management</h2><p>Create accounts for staff who operate the terminal.</p></div></div><div className="panel admin-panel"><form className="form-grid" onSubmit={submit}><label>Cashier username<input value={username} onChange={e=>setUsername(e.target.value)} required /></label><label>Temporary password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button className="primary" disabled={loading}>{loading?'Creating…':'Create cashier'}</button></form></div></div>;
}
