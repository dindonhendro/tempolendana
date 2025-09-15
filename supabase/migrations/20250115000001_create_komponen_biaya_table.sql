CREATE TABLE IF NOT EXISTS komponen_biaya (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Biaya persiapan penempatan
  biaya_pelatihan INTEGER DEFAULT 0,
  biaya_sertifikasi INTEGER DEFAULT 0,
  biaya_jasa_perusahaan INTEGER DEFAULT 0,
  biaya_transportasi_lokal INTEGER DEFAULT 0,
  biaya_visa_kerja INTEGER DEFAULT 0,
  biaya_tiket_keberangkatan INTEGER DEFAULT 0,
  biaya_tiket_pulang INTEGER DEFAULT 0,
  biaya_akomodasi INTEGER DEFAULT 0,
  
  -- Biaya berkaitan dengan penempatan
  biaya_pemeriksaan_kesehatan INTEGER DEFAULT 0,
  biaya_jaminan_sosial INTEGER DEFAULT 0,
  biaya_apostille INTEGER DEFAULT 0,
  
  -- Biaya lain-lain
  biaya_lain_lain_1 INTEGER DEFAULT 0,
  biaya_lain_lain_2 INTEGER DEFAULT 0,
  keterangan_biaya_lain TEXT,
  
  -- Calculated totals
  total_biaya_persiapan INTEGER GENERATED ALWAYS AS (
    biaya_pelatihan + biaya_sertifikasi + biaya_jasa_perusahaan + 
    biaya_transportasi_lokal + biaya_visa_kerja + biaya_tiket_keberangkatan + 
    biaya_tiket_pulang + biaya_akomodasi
  ) STORED,
  
  total_biaya_penempatan INTEGER GENERATED ALWAYS AS (
    biaya_pemeriksaan_kesehatan + biaya_jaminan_sosial + biaya_apostille
  ) STORED,
  
  total_biaya_lain_lain INTEGER GENERATED ALWAYS AS (
    biaya_lain_lain_1 + biaya_lain_lain_2
  ) STORED,
  
  total_keseluruhan INTEGER GENERATED ALWAYS AS (
    biaya_pelatihan + biaya_sertifikasi + biaya_jasa_perusahaan + 
    biaya_transportasi_lokal + biaya_visa_kerja + biaya_tiket_keberangkatan + 
    biaya_tiket_pulang + biaya_akomodasi + biaya_pemeriksaan_kesehatan + 
    biaya_jaminan_sosial + biaya_apostille + biaya_lain_lain_1 + biaya_lain_lain_2
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_loan_application_id ON komponen_biaya(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_user_id ON komponen_biaya(user_id);
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_created_at ON komponen_biaya(created_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE komponen_biaya;

-- Add comments for documentation
COMMENT ON TABLE komponen_biaya IS 'Tabel untuk menyimpan komponen biaya PMI dari form aplikasi';
COMMENT ON COLUMN komponen_biaya.biaya_pelatihan IS 'Biaya pelatihan PMI';
COMMENT ON COLUMN komponen_biaya.biaya_sertifikasi IS 'Biaya sertifikasi kompetensi';
COMMENT ON COLUMN komponen_biaya.biaya_jasa_perusahaan IS 'Biaya jasa perusahaan';
COMMENT ON COLUMN komponen_biaya.biaya_transportasi_lokal IS 'Biaya transportasi lokal dari daerah asal ke tempat keberangkatan';
COMMENT ON COLUMN komponen_biaya.biaya_visa_kerja IS 'Biaya visa kerja';
COMMENT ON COLUMN komponen_biaya.biaya_tiket_keberangkatan IS 'Biaya tiket keberangkatan';
COMMENT ON COLUMN komponen_biaya.biaya_tiket_pulang IS 'Biaya tiket pulang';
COMMENT ON COLUMN komponen_biaya.biaya_akomodasi IS 'Biaya akomodasi';
COMMENT ON COLUMN komponen_biaya.biaya_pemeriksaan_kesehatan IS 'Biaya pemeriksaan kesehatan dan psikologi';
COMMENT ON COLUMN komponen_biaya.biaya_jaminan_sosial IS 'Biaya jaminan sosial pekerja migran Indonesia';
COMMENT ON COLUMN komponen_biaya.biaya_apostille IS 'Biaya apostille';
COMMENT ON COLUMN komponen_biaya.total_keseluruhan IS 'Total keseluruhan biaya (calculated field)';