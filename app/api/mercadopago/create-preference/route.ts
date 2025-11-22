import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';

// Configura o access token do Mercado Pago a partir do .env.local
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');

export async function POST(request: Request) {
  try {
    const { title, price } = await request.json();

    const preference = {
      items: [
        {
          title,
          quantity: 1,
          unit_price: Number(price),
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: 'http://localhost:8080/success',
        failure: 'http://localhost:8080/failure',
        pending: 'http://localhost:8080/pending'
      },
      auto_return: 'approved'
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({ id: response.body.id });
  } catch (error) {
    console.error('Erro criando a preferência Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro ao criar preferência' }, { status: 500 });
  }
}
