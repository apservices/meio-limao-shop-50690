export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          district: string
          id: string
          is_default: boolean | null
          label: string | null
          name: string
          number: string
          phone: string | null
          state: string
          street: string
          updated_at: string | null
          zipcode: string
        }
        Insert: {
          city: string
          complement?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          district: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          name: string
          number: string
          phone?: string | null
          state: string
          street: string
          updated_at?: string | null
          zipcode: string
        }
        Update: {
          city?: string
          complement?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          district?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          name?: string
          number?: string
          phone?: string | null
          state?: string
          street?: string
          updated_at?: string | null
          zipcode?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          image_url: string | null
          name_snapshot: string
          product_id: string
          qty: number
          sku_snapshot: string | null
          unit_price_cents: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name_snapshot: string
          product_id: string
          qty?: number
          sku_snapshot?: string | null
          unit_price_cents: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name_snapshot?: string
          product_id?: string
          qty?: number
          sku_snapshot?: string | null
          unit_price_cents?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          discount_cents: number | null
          id: string
          session_id: string | null
          shipping_cents: number | null
          subtotal_cents: number | null
          total_cents: number | null
          updated_at: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_cents?: number | null
          id?: string
          session_id?: string | null
          shipping_cents?: number | null
          subtotal_cents?: number | null
          total_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_cents?: number | null
          id?: string
          session_id?: string | null
          shipping_cents?: number | null
          subtotal_cents?: number | null
          total_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collection_products: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          metadata: Json | null
          name: string
          phone: string | null
          source: string | null
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          metadata?: Json | null
          name: string
          phone?: string | null
          source?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          metadata?: Json | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          ends_at: string | null
          first_purchase_only: boolean | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_subtotal_cents: number | null
          starts_at: string | null
          type: string
          updated_at: string | null
          used_count: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          ends_at?: string | null
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_subtotal_cents?: number | null
          starts_at?: string | null
          type: string
          updated_at?: string | null
          used_count?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string | null
          ends_at?: string | null
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_subtotal_cents?: number | null
          starts_at?: string | null
          type?: string
          updated_at?: string | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          document: string | null
          email: string
          id: string
          marketing_opt_in: boolean | null
          name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          email: string
          id?: string
          marketing_opt_in?: boolean | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          email?: string
          id?: string
          marketing_opt_in?: boolean | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      looks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          product_ids: string[] | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          product_ids?: string[] | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          product_ids?: string[] | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_addresses: {
        Row: {
          city: string
          complement: string | null
          country: string | null
          created_at: string | null
          district: string
          id: string
          name: string
          number: string
          order_id: string
          phone: string | null
          state: string
          street: string
          type: string
          zipcode: string
        }
        Insert: {
          city: string
          complement?: string | null
          country?: string | null
          created_at?: string | null
          district: string
          id?: string
          name: string
          number: string
          order_id: string
          phone?: string | null
          state: string
          street: string
          type: string
          zipcode: string
        }
        Update: {
          city?: string
          complement?: string | null
          country?: string | null
          created_at?: string | null
          district?: string
          id?: string
          name?: string
          number?: string
          order_id?: string
          phone?: string | null
          state?: string
          street?: string
          type?: string
          zipcode?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name_snapshot: string
          order_id: string
          product_id: string | null
          qty: number
          sku_snapshot: string | null
          unit_price_cents: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name_snapshot: string
          order_id: string
          product_id?: string | null
          qty?: number
          sku_snapshot?: string | null
          unit_price_cents: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name_snapshot?: string
          order_id?: string
          product_id?: string | null
          qty?: number
          sku_snapshot?: string | null
          unit_price_cents?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          metadata: Json | null
          name: string | null
          source: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          discount_cents: number | null
          email: string | null
          id: string
          notes: string | null
          order_number: number
          payment_method: string | null
          payment_status: string | null
          shipment_status: string | null
          shipping_cents: number | null
          status: string
          subtotal_cents: number | null
          total: number
          total_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_cents?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_status?: string | null
          shipment_status?: string | null
          shipping_cents?: number | null
          status?: string
          subtotal_cents?: number | null
          total: number
          total_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_cents?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_status?: string | null
          shipment_status?: string | null
          shipping_cents?: number | null
          status?: string
          subtotal_cents?: number | null
          total?: number
          total_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          order_id: string
          payload: Json | null
          provider: string
          provider_ref: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          order_id: string
          payload?: Json | null
          provider: string
          provider_ref?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payload?: Json | null
          provider?: string
          provider_ref?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          allow_backorder: boolean | null
          barcode: string | null
          compare_at_price_cents: number | null
          cost_cents: number | null
          created_at: string | null
          id: string
          image_url: string | null
          inventory_qty: number | null
          is_active: boolean | null
          option1_label: string | null
          option1_value: string | null
          option2_label: string | null
          option2_value: string | null
          price_cents: number
          product_id: string
          sku: string
          track_inventory: boolean | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          barcode?: string | null
          compare_at_price_cents?: number | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          inventory_qty?: number | null
          is_active?: boolean | null
          option1_label?: string | null
          option1_value?: string | null
          option2_label?: string | null
          option2_value?: string | null
          price_cents: number
          product_id: string
          sku: string
          track_inventory?: boolean | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          barcode?: string | null
          compare_at_price_cents?: number | null
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          inventory_qty?: number | null
          is_active?: boolean | null
          option1_label?: string | null
          option1_value?: string | null
          option2_label?: string | null
          option2_value?: string | null
          price_cents?: number
          product_id?: string
          sku?: string
          track_inventory?: boolean | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          is_new: boolean | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews_count: number | null
          sizes: string[] | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_new?: boolean | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_new?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      returns_rma: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_rma_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string
          rating: number
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id: string
          rating: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string
          rating?: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          cost_cents: number | null
          created_at: string | null
          id: string
          label_url: string | null
          order_id: string
          payload: Json | null
          provider: string
          status: string | null
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          label_url?: string | null
          order_id: string
          payload?: Json | null
          provider: string
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          label_url?: string | null
          order_id?: string
          payload?: Json | null
          provider?: string
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          variant_id: string | null
          wishlist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          variant_id?: string | null
          wishlist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          variant_id?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
