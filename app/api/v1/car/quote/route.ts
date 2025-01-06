import { NextRequest, NextResponse } from 'next/server';
import { CarQuoteService } from '@/services/car-quote.service';

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();

        // Create quote service and process request
        const quote = new CarQuoteService();
        const response = await quote.processQuoteRequest(body);

        // Return successful response
        return NextResponse.json(response);
    } catch (error) {
        // Handle errors
        if (error instanceof Error) {
            return NextResponse.json({
                status: 'error',
                message: error.message
            }, { status: 500 });
        } else {
            return NextResponse.json({
                status: 'error',
                message: 'An unexpected error occurred'
            }, { status: 500 });
        }
    }
}
