-- Table: public.push_subscription

-- DROP TABLE IF EXISTS public.push_subscription;

CREATE TABLE IF NOT EXISTS public.push_subscription
(
    serverid character varying(32) COLLATE pg_catalog."default" NOT NULL,
    subscription jsonb NOT NULL,
    os integer,
    CONSTRAINT push_subscription_pkey PRIMARY KEY (serverid, subscription)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.push_subscription
    OWNER to postgres;