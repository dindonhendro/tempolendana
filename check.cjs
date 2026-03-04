const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';
fetch('http://103.127.135.216:8000/rest/v1/loan_applications?select=*&limit=1', { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } })
    .then(r => r.json())
    .then(d => {
        if (d && d.length > 0) console.log('Columns:', Object.keys(d[0]).join(', '));
        else console.log('Empty', d);
    })
    .catch(console.error);
