import { sendWhatsAppMessage } from "@/app/api/sendMessage/sendMessage";
import { NextRequest, NextResponse } from "next/server";
import { DBTables } from "@/lib/enums/Tables";
import { createClient } from "@/utils/supabase-server";
import { TemplateRequest, TextParameter } from "@/types/message-template-request";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return new NextResponse('Missing Authorization header', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
        return new NextResponse('Invalid or expired token', { status: 403, headers: corsHeaders });
    }

    const supabase = createClient();
    const reqFormData = await request.formData();

    const to = reqFormData.get('Phone')?.toString();
    if (!to) {
        return new NextResponse('Missing "Phone" field', { status: 400, headers: corsHeaders });
    }

    const firstName = reqFormData.get('FirstName')?.toString();
    if (!firstName) {
        return new NextResponse('Missing "FirstName" field', { status: 400, headers: corsHeaders });
    }

    const lastName = reqFormData.get('LastName')?.toString();
    if (!lastName) {
        return new NextResponse('Missing "LastName" field', { status: 400, headers: corsHeaders });
    }

    const quoteGuid = reqFormData.get('PreventivoGuid')?.toString();
    if (!quoteGuid) {
        return new NextResponse('Missing "PreventivoGuid" field', { status: 400, headers: corsHeaders });
    }

    const hotelId = reqFormData.get('HotelId')?.toString();
    if (!hotelId) {
        return new NextResponse('Missing "hotelId" field', { status: 400, headers: corsHeaders });
    }

    const message = reqFormData.get('message')?.toString();
    const fileType = reqFormData.get('fileType')?.toString();
    const file: File | null = reqFormData.get('file') as File | null;

    const languageCode = 'it-IT';

    let { data: hotelData, error: hotelError } = await supabase
    .from(DBTables.Hotels)
    .select('*')
    .eq('hotel_id', hotelId)
    .single();

    let hotelZone = hotelData.hotel_zone;
    let preventivoName = hotelData.template_preventivo_name;

    let template = await getTemplateRequest(firstName, languageCode, quoteGuid,preventivoName);
    
    let error = await sendWhatsAppMessage(to, message, fileType, file, template,hotelZone);
    if (error){
        return new NextResponse(error.message, { status: 400, headers: corsHeaders });
    }

    let { data: contactsData, error: contactsError } = await supabase
                          .from(DBTables.Contacts)
                          .select('wa_id')
                          .eq('wa_id', to)
                          .single();
    if (contactsError) console.error('Error while fetching contact or contact not in list:', contactsError);
    let contactInList = contactsData != null;

    if (contactInList)
    {
        let { error } = await supabase
                        .from(DBTables.Contacts)
                        .update({ last_message_at: new Date() })
                        .eq('wa_id', to);

        if (error) console.error('Error while updating contact:', error);

    }
    else
    {
        let { error } = await supabase
                        .from(DBTables.Contacts)
                        .upsert({
                        wa_id: to,
                        profile_name: firstName + " " + lastName,
                        last_message_at: new Date(),
                        last_message_received_at: new Date(),
                        in_chat: true
                        })
        if (error) console.error('Error while adding contact:', error);
    }

    return new NextResponse('Whatsapp message sent', {
        status: 200,
        headers: corsHeaders
    });
}

function verifyToken(token: string): boolean {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
        return !!decoded; // Token is valid
    } catch (err) {
        console.error('Token verification failed:', err);
        return false; // Token is invalid
    }
}

function getTemplateRequest(firstName : string, languageCode:string, quoteGuid: string, preventivoName: string) : TemplateRequest{

    const templateRequest: TemplateRequest = {
        name: preventivoName,
        language: {
            code: languageCode.split("-")[0]
        },
        components: [
            {
                type: "header",
                parameters: [
                    {
                        type: "text",
                        text: firstName
                    }
                ]
            },
            {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                    {
                        type : "payload",
                        payload : languageCode + "/Quotation?guid=" + quoteGuid
                    }
                ]
            }
        ]
    };

    return templateRequest;
}

