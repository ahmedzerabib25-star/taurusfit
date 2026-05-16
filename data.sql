-- Add multilingual bundle banner columns
ALTER TABLE bundle
  ADD COLUMN IF NOT EXISTS title_en       TEXT DEFAULT 'RAMP UP YOUR PERFORMANCE',
  ADD COLUMN IF NOT EXISTS title_fr       TEXT DEFAULT 'BOOSTEZ VOS PERFORMANCES',
  ADD COLUMN IF NOT EXISTS title_ar       TEXT DEFAULT 'ارفع مستوى أدائك',
  ADD COLUMN IF NOT EXISTS description_fr TEXT DEFAULT 'Obtenez notre bundle le plus populaire à -20%. Stock limité — commandez maintenant.',
  ADD COLUMN IF NOT EXISTS description_ar TEXT DEFAULT 'احصل على باقتنا الأكثر مبيعاً بخصم 20%. مخزون محدود — اطلب الآن.';
