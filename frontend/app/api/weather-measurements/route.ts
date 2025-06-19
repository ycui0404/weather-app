import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'data',
  password: 'niniKai5619',
  database: 'data',
});

export async function POST(req: NextRequest) {
  const { location, measurements } = await req.json();
  const conn = await pool.getConnection();
  try {
    for (const m of measurements) {
      await conn.query(
        'INSERT INTO weather_measurements (location, measurement_date, temp_c) VALUES (?, ?, ?)',
        [location, m.date, m.temp_c]
      );
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } finally {
    conn.release();
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all');
  if (all === 'true') {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT * FROM weather_measurements ORDER BY measurement_date DESC, location ASC'
      );
      return NextResponse.json(rows, { status: 200 });
    } finally {
      conn.release();
    }
  }
  const location = searchParams.get('location');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  if (!location || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM weather_measurements WHERE location = ? AND measurement_date BETWEEN ? AND ? ORDER BY measurement_date ASC',
      [location, startDate, endDate]
    );
    return NextResponse.json(rows, { status: 200 });
  } finally {
    conn.release();
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM weather_measurements WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } finally {
    conn.release();
  }
} 