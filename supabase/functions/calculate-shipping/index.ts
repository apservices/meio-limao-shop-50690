import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MELHOR_ENVIO_TOKEN = Deno.env.get("MELHOR_ENVIO_TOKEN");
const MELHOR_ENVIO_SANDBOX =
  (Deno.env.get("MELHOR_ENVIO_SANDBOX") || "")
    .toString()
    .trim()
    .toLowerCase() === "true";
const MELHOR_ENVIO_BASE_URL = MELHOR_ENVIO_SANDBOX
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://www.melhorenvio.com.br/api/v2";

type DeliveryRange = {
  min?: number;
  max?: number;
} | null;

type DeliveryTime = {
  days?: number;
  min?: number;
  max?: number;
} | null;

type MelhorEnvioCompany = {
  id?: string | number | null;
  name?: string;
  picture?: string | null;
  logo?: string | null;
} | null;

type MelhorEnvioOption = {
  id?: string | number | null;
  service_id?: string | number | null;
  name?: string | null;
  price?: number | string | null;
  delivery_price?: number | string | null;
  discount?: number | string | null;
  delivery_range?: DeliveryRange;
  delivery_time?: DeliveryTime;
  company?: MelhorEnvioCompany;
  error?: unknown;
};

type Volume = {
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
};

type RequestItem = {
  quantity?: number;
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
  price?: number;
};

type RequestBody = {
  cep?: string;
  weight?: number;
  items?: RequestItem[];
};

const DEFAULT_VOLUME = {
  width: 16,
  height: 2,
  length: 23,
  weight: 0.3,
  insurance_value: 50,
};

const sanitizeCep = (value?: string | null) => value?.replace(/\D/g, "") ?? "";

const ORIGIN_POSTAL_CODE = (() => {
  const fromEnv = sanitizeCep(Deno.env.get("MELHOR_ENVIO_ORIGIN_POSTAL_CODE"));
  if (fromEnv && fromEnv.length === 8) return fromEnv;
  return "01001000";
})();

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallback;
};

const sanitizeServiceIds = (value?: string | null) => {
  if (!value) return [] as string[];

  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^(\d+)$/.test(id));
};

let cachedServiceIds: string[] | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMelhorEnvioOption = (value: unknown): value is MelhorEnvioOption =>
  isRecord(value);

const fetchAvailableServiceIds = async () => {
  if (cachedServiceIds && cachedServiceIds.length > 0) return cachedServiceIds;

  try {
    const res = await fetch(`${MELHOR_ENVIO_BASE_URL}/me/shipment/services`, {
      headers: {
        Authorization: "Bearer " + MELHOR_ENVIO_TOKEN,
        Accept: "application/json",
        "User-Agent": "MeioLimaoShop (frete@meiolimao.shop)",
      },
    });

    const data = await safeParseJson(res);

    if (!res.ok || !Array.isArray(data)) {
      console.error("Failed to fetch service ids", data);
      return [] as string[];
    }

    cachedServiceIds = data
      .map((service) => {
        if (!isRecord(service)) return null;
        const id = (service as { id?: string | number | null }).id;
        if (typeof id === "string" || typeof id === "number") return String(id);
        return null;
      })
      .filter((id): id is string => Boolean(id));

    return cachedServiceIds ?? [];
  } catch (error) {
    console.error("Unexpected error while fetching service ids", error);
    return [] as string[];
  }
};

const safeParseJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.clone().json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
};

const formatDeliveryTime = (
  opt: Pick<MelhorEnvioOption, "delivery_range" | "delivery_time">,
) => {
  const minDays = opt.delivery_range?.min ?? opt.delivery_time?.min ?? opt.delivery_time?.days;
  const maxDays = opt.delivery_range?.max ?? opt.delivery_time?.max ?? opt.delivery_time?.days;

  if (minDays && maxDays && minDays !== maxDays) {
    return `${minDays}-${maxDays} dias úteis`;
  }

  if (minDays || maxDays) {
    const value = minDays ?? maxDays;
    return `${value} dia(s) útil(eis)`;
  }

  return null;
};

serve(async (req) => {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  if (!MELHOR_ENVIO_TOKEN) {
    return new Response(
      JSON.stringify({ error: "MELHOR_ENVIO_TOKEN não configurado" }),
      { status: 500, headers: jsonHeaders },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const { cep, weight, items } = (body ?? {}) as RequestBody;

  const sanitizedCep = sanitizeCep(typeof cep === "string" ? cep : "");

  if (!sanitizedCep || sanitizedCep.length !== 8) {
    return new Response(
      JSON.stringify({ error: "CEP inválido" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const volumes: Volume[] = [];

  if (Array.isArray(items) && items.length > 0) {
    items.forEach((item) => {
      const quantity = parsePositiveNumber(item.quantity, 1);
      const volume = {
        width: parsePositiveNumber(item.width, DEFAULT_VOLUME.width),
        height: parsePositiveNumber(item.height, DEFAULT_VOLUME.height),
        length: parsePositiveNumber(item.length, DEFAULT_VOLUME.length),
        weight: parsePositiveNumber(item.weight ?? weight, DEFAULT_VOLUME.weight),
        insurance_value: parsePositiveNumber(item.price, DEFAULT_VOLUME.insurance_value),
      };

      for (let i = 0; i < quantity; i++) {
        volumes.push(volume);
      }
    });
  }

  if (volumes.length === 0) {
    volumes.push({ ...DEFAULT_VOLUME, weight: parsePositiveNumber(weight, DEFAULT_VOLUME.weight) });
  }

  const fromPostalCode = ORIGIN_POSTAL_CODE;

  const requestBody = {
    from: { postal_code: fromPostalCode },
    to: { postal_code: sanitizedCep },
    volumes,
  };

  try {
    const envServiceIds = sanitizeServiceIds(Deno.env.get("MELHOR_ENVIO_SERVICE_IDS"));
    const availableServiceIds = envServiceIds.length > 0
      ? envServiceIds
      : await fetchAvailableServiceIds();

    const finalRequestBody = {
      ...requestBody,
      ...(availableServiceIds.length > 0
        ? { services: availableServiceIds.join(",") }
        : {}),
    };

    const meRes = await fetch(
      `${MELHOR_ENVIO_BASE_URL}/me/shipment/calculate`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + MELHOR_ENVIO_TOKEN,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MeioLimaoShop (frete@meiolimao.shop)",
        },
        body: JSON.stringify(finalRequestBody),
      },
    );

    const meData = await safeParseJson(meRes);

    if (!meRes.ok) {
      console.error("Melhor Envio error:", meData);
      return new Response(
        JSON.stringify({
          error: "Erro ao calcular frete no Melhor Envio",
          details: meData,
          status: meRes.status,
        }),
        { status: 200, headers: jsonHeaders },
      );
    }

    if (!Array.isArray(meData) || meData.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Nenhuma opção retornada pelo Melhor Envio",
          details: meData,
          options: [],
          status: meRes.status,
        }),
        { status: 200, headers: jsonHeaders },
      );
    }

    const parsedOptions = meData.filter(isMelhorEnvioOption);
    const successfulOptions = parsedOptions.filter((opt) => !opt.error);

    if (successfulOptions.length === 0) {
      const errors = parsedOptions
        .map((opt) => opt?.error ?? null)
        .filter(Boolean);

      return new Response(
        JSON.stringify({
          error: "Nenhuma opção disponível para o CEP informado.",
          details: errors,
          options: [],
          status: meRes.status,
        }),
        { status: 200, headers: jsonHeaders },
      );
    }

    const options = successfulOptions
      .map((opt) => {
        const formattedDelivery = formatDeliveryTime(opt);
        const deliveryDays = opt.delivery_time?.days
          ?? opt.delivery_range?.max
          ?? opt.delivery_range?.min
          ?? undefined;

        return {
          id: opt.id ?? opt.service_id ?? `${opt.company?.id ?? ""}-${opt.name ?? ""}`,
          name: opt.name ?? "Entrega",
          price: Number(opt.price ?? opt.delivery_price ?? 0),
          discount: opt.discount ? Number(opt.discount) : undefined,
          delivery_time: {
            days: deliveryDays ? Number(deliveryDays) : undefined,
            formatted: formattedDelivery ?? undefined,
          },
          delivery_range: opt.delivery_range ?? undefined,
          company: {
            name: opt.company?.name ?? "",
            picture: opt.company?.picture ?? opt.company?.logo ?? null,
          },
          custom_delivery_time: formattedDelivery ?? undefined,
          raw: opt,
        };
      });

    return new Response(
      JSON.stringify({ options }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("Unexpected error in calculate-shipping:", error);
    return new Response(
      JSON.stringify({ error: "Erro inesperado ao calcular frete" }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
