-- PhoneZone baseline for a NEW, EMPTY PostgreSQL public schema.
-- Existing databases require the adoption procedure in docs/deployment.md.
-- Sequence increments match Hibernate Panache allocationSize=50. No user data.

CREATE TABLE public.cart_items (
    quantity integer,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    product_id bigint,
    user_id bigint
);

CREATE SEQUENCE public.cart_items_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.categories (
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    description character varying(255),
    name character varying(255) NOT NULL
);

CREATE SEQUENCE public.categories_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.contact_messages (
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    message character varying(1000) NOT NULL,
    budget character varying(255),
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    service character varying(255),
    status character varying(255)
);

CREATE SEQUENCE public.contact_messages_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.coupons (
    is_active boolean,
    points_required integer NOT NULL,
    created_at timestamp(6) without time zone,
    discount_amount bigint NOT NULL,
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    description text
);

CREATE SEQUENCE public.coupons_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.order_items (
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    order_id bigint,
    product_id bigint,
    unit_price bigint NOT NULL
);

CREATE SEQUENCE public.order_items_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.orders (
    earned_points integer,
    rewards_credited boolean DEFAULT true,
    created_at timestamp(6) without time zone,
    discount_amount bigint,
    final_amount bigint NOT NULL,
    id bigint NOT NULL,
    shipping_fee bigint DEFAULT 0,
    total_amount bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    used_coupon_id bigint,
    user_id bigint,
    customer_phone character varying(20) NOT NULL,
    payment_method character varying(50),
    status character varying(50),
    customer_email character varying(100),
    customer_name character varying(100) NOT NULL,
    shipping_address text NOT NULL
);

CREATE SEQUENCE public.orders_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.products (
    is_active boolean,
    stock_quantity integer,
    category_id bigint,
    created_at timestamp(6) without time zone,
    gia_ban_so bigint,
    gia_goc_so bigint,
    id bigint NOT NULL,
    thoi_gian_cao timestamp(6) without time zone,
    danh_muc character varying(255),
    gia_ban character varying(255),
    gia_goc character varying(255),
    hinh_anh text,
    link text,
    ten_san_pham text NOT NULL,
    thong_so jsonb
);

CREATE SEQUENCE public.products_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.repair_services (
    created_at timestamp(6) without time zone,
    gia_so bigint,
    id bigint NOT NULL,
    thoi_gian_cao timestamp(6) without time zone,
    gia_hien_thi character varying(255),
    link character varying(255),
    ten_dich_vu character varying(255) NOT NULL
);

CREATE SEQUENCE public.repair_services_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.repairs (
    appointment_date timestamp(6) without time zone,
    completion_date timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    estimated_cost bigint,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    issue_description character varying(1000) NOT NULL,
    technician_notes character varying(1000),
    customer_email character varying(255),
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(255) NOT NULL,
    device_model character varying(255) NOT NULL,
    device_type character varying(255) NOT NULL,
    priority character varying(255),
    repair_service character varying(255) NOT NULL,
    status character varying(255) NOT NULL
);

CREATE SEQUENCE public.repairs_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.user_coupons (
    acquired_at timestamp(6) without time zone,
    coupon_id bigint,
    id bigint NOT NULL,
    used_at timestamp(6) without time zone,
    user_id bigint,
    status character varying(20)
);

CREATE SEQUENCE public.user_coupons_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.users (
    reward_points integer,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    phone character varying(20),
    role character varying(20),
    username character varying(50) NOT NULL,
    email character varying(100),
    full_name character varying(100),
    address text,
    password_hash character varying(255) NOT NULL
);

CREATE SEQUENCE public.users_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.repair_services
    ADD CONSTRAINT repair_services_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT user_coupons_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT fk1pds1e9o0wbdir6bfoa28ipwk FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk1re40cjegsfvw58xrkdp6bac6 FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk32ql8ubntj5uh44ph9659tiih FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk6499e96wrqejq35554w89ej5d FOREIGN KEY (used_coupon_id) REFERENCES public.user_coupons(id);

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT fk654lvm2qu8l08pyg310mbd74h FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk709eickf3kc0dujx3ub9i7btf FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT fk9oi3p5xyfe4j32xs54nn7mi20 FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkocimc7dtr037rh4ls4l95nlfi FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES public.categories(id);
