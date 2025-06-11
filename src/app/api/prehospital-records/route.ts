import { NextRequest, NextResponse } from 'next/server';
import { savePreHospitalRecord, getPreHospitalRecordsByPatient, getAllPreHospitalRecords } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recordId = await savePreHospitalRecord(body);
    
    return NextResponse.json({ 
      success: true, 
      id: recordId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/prehospital-records:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save pre-hospital record' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    if (patientId) {
      // Get records for specific patient
      const records = await getPreHospitalRecordsByPatient(patientId);
      return NextResponse.json(records, { status: 200 });
    } else {
      // Get all records
      const records = await getAllPreHospitalRecords();
      return NextResponse.json(records, { status: 200 });
    }
  } catch (error) {
    console.error('Error in GET /api/prehospital-records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pre-hospital records' },
      { status: 500 }
    );
  }
} 