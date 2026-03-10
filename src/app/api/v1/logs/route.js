import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {errorResponse, successResponse} from "../../../../lib/response";

export async function GET(req) {

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code !== process.env.LOG_CODE) {
        return NextResponse.json(errorResponse('You are not authorized to view logs', 401));
    }

    const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

    if (!fs.existsSync(logFilePath)) {
        return NextResponse.json({ error: 'Log file not found' }, { status: 404 });
    }

    const data = fs.readFileSync(logFilePath, 'utf8');
    const lines = data
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

    return NextResponse.json(successResponse(lines, 'Logs retrieved successfully'));
}