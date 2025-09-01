import { NextRequest, NextResponse } from 'next/server';
import { getUnavailableDates, checkAvailability } from '@/lib/availability';
import { UnitType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get('unit') as UnitType;
    const persons = parseInt(searchParams.get('persons') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action') || 'unavailable'; // 'unavailable' or 'validate'

    if (!unit || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: unit, startDate, endDate' },
        { status: 400 }
      );
    }

    if (action === 'validate') {
      // Validar disponibilidad para fechas específicas
      const availabilityCheck = await checkAvailability(unit, persons, startDate, endDate);
      return NextResponse.json({ 
        available: availabilityCheck.available,
        message: availabilityCheck.message 
      });
    } else {
      // Obtener fechas no disponibles
      const unavailableDates = await getUnavailableDates(unit, persons, startDate, endDate);
      return NextResponse.json({ unavailableDates });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}