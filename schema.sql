-- ==========================================
-- SITEKS DUKCAPIL - SUPABASE DATABASE SCHEMA
-- Jalankan query ini di Supabase SQL Editor
-- ==========================================

-- 1. Tabel Templates
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'Twitter')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabel Schedules
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabel Schedule Platforms (Relasi Platform per Jadwal)
CREATE TABLE IF NOT EXISTS public.schedule_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'Twitter')),
    is_uploaded BOOLEAN NOT NULL DEFAULT false,
    uploaded_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_platforms ENABLE ROW LEVEL SECURITY;

-- Policy untuk Templates
CREATE POLICY "Users can manage their own templates"
    ON public.templates
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy untuk Schedules
CREATE POLICY "Users can manage their own schedules"
    ON public.schedules
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy untuk Schedule Platforms
CREATE POLICY "Users can manage their own schedule platforms"
    ON public.schedule_platforms
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules
            WHERE schedules.id = schedule_platforms.schedule_id
            AND schedules.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules
            WHERE schedules.id = schedule_platforms.schedule_id
            AND schedules.user_id = auth.uid()
        )
    );
